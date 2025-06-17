<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Promotion;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('user', 'items.product')->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,wallet',
            'address' => 'required|array',
            'address.label' => 'required|string',
            'address.street' => 'required|string',
            'address.aptNo' => 'nullable|string',
            'address.floor' => 'nullable|string',
            'address.description' => 'nullable|string',
            'promo_code' => 'nullable|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $discountPercentage = $validated['discount_percentage'] ?? 0;
        if ($request->has('promo_code') && $request->promo_code) {
            $promo = Promotion::where('code', $request->promo_code)
                ->where('is_active', true)
                ->where('expiration_date', '>', now())
                ->first();

            if (!$promo) {
                return response()->json(['message' => 'Invalid or expired promo code'], 422);
            }

            $discountPercentage = $promo->discount_percentage;
            $validated['discount_percentage'] = $discountPercentage;

            $subtotal = $validated['total'];
            $discountAmount = ($subtotal * $discountPercentage) / 100;
            $validated['total'] = $subtotal - $discountAmount;
        }

        $order = Order::create([
            'user_id' => $user->id,
            'total' => $validated['total'],
            'status' => 'pending',
            'payment_status' => $validated['payment_method'] === 'cash' ? 'pending' : 'paid',
            'payment_method' => $validated['payment_method'],
            'promo_code' => $request->promo_code,
            'discount_percentage' => $discountPercentage,
            'address' => json_encode($request->address),
        ]);

        // Log initial status
        DB::table('order_status_history')->insert([
            'order_id' => $order->id,
            'status' => 'pending',
            'changed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        $order->load('user', 'items.product');

        return response()->json($order, 201);
    }

    public function show($id)
    {
        $order = Order::with('user', 'items.product')->findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $validated['status'];
        $order->save();

        // Log status change
        DB::table('order_status_history')->insert([
            'order_id' => $order->id,
            'status' => $validated['status'],
            'changed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json($order);
    }

    public function getStatusHistory($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        \Log::info('Fetching status history', [
            'user_id' => $user->id,
            'order_id' => $id
        ]);

        $order = Order::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            \Log::warning('Order not found', [
                'user_id' => $user->id,
                'order_id' => $id
            ]);
            return response()->json(['message' => 'Order not found'], 404);
        }

        $history = DB::table('order_status_history')
            ->where('order_id', $id)
            ->orderBy('changed_at', 'asc')
            ->get();

        \Log::info('Found status history', [
            'order_id' => $id,
            'history_count' => $history->count()
        ]);

        return response()->json($history);
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,failed',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['payment_status' => $request->payment_status]);
        return response()->json($order);
    }

    public function userOrders()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $orders = Order::with(['items.product'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order deleted']);
    }
}
