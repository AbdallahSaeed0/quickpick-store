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

    // Add to OrderController.php
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
    $history = DB::table('order_status_history')
        ->where('order_id', $id)
        ->orderBy('changed_at', 'asc')
        ->get();
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

    // Check if user is an instance of App\Models\User
    if ($user instanceof \App\Models\User) {
        $orders = $user->orders()->with('items.product')->get();
        return response()->json($orders);
    }

    // Handle Admin or other user types
    return response()->json(['message' => 'Orders are not available for this user type'], 403);
}

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order deleted']);
    }
}
