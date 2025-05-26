<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:255',
            'password' => 'required|string|min:6',
            'is_admin' => 'boolean',
            'wallet' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        // Hash the password
        $validated['password'] = Hash::make($validated['password']);
        $validated['wallet'] = $validated['wallet'] ?? 0.00;

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('users', 'public');
        }

        // Create the user
        $user = User::create($validated);

        return response()->json([
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'phone', 'gender', 'address', 'is_admin', 'wallet', 'image', 'created_at']),
            'message' => 'User created successfully',
        ], 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Error creating user: ' . $e->getMessage());
        return response()->json([
            'message' => 'Server error',
            'error' => $e->getMessage(),
        ], 500);
    }
}
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;
            return response()->json([
                'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'is_admin']),
                'token' => $token,
            ], 200);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'password' => 'required|string|min:6',
            'is_admin' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['wallet'] = 0.00;

        $user = User::create($validated);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'is_admin']),
            'token' => $token,
        ], 201);
    }

   public function me(Request $request)
{
    $user = Auth::user();
    if (!$user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
    $userData = $user->toArray();
    $userData['cards'] = is_array($user->cards) ? $user->cards : (json_decode($user->cards, true) ?? []);
    $userData['addresses'] = is_array($user->addresses) ? $user->addresses : (json_decode($user->addresses, true) ?? []); // Add this line
    return response()->json($userData);
}

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
{
    try {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Ensure the authenticated user can only update their own profile
        if (Auth::id() !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Decode addresses if sent as a JSON string
        $input = $request->all();
        if (isset($input['addresses']) && is_string($input['addresses'])) {
            $input['addresses'] = json_decode($input['addresses'], true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($input['addresses'])) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['addresses' => ['The addresses field must be a valid JSON array.']],
                ], 422);
            }
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'wallet' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|max:2048',
            'addresses' => 'sometimes|array',
            'addresses.*.id' => 'nullable|integer',
            'addresses.*.label' => 'required|string',
            'addresses.*.type' => 'required|string',
            'addresses.*.aptNo' => 'nullable|string',
            'addresses.*.floor' => 'nullable|string',
            'addresses.*.street' => 'required|string',
            'addresses.*.description' => 'nullable|string',
            'addresses.*.isDefault' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($user->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->image);
            }
            $validated['image'] = $request->file('image')->store('users', 'public');
        }

        // Encode addresses as JSON string before saving
        if (isset($validated['addresses'])) {
            $validated['addresses'] = json_encode($validated['addresses']);
        }

        // Update only provided fields
        $user->update(array_filter($validated, fn($value) => !is_null($value) && $value !== ''));

        // Return user with decoded addresses for consistency
        $userData = $user->toArray();
        $userData['addresses'] = is_array($user->addresses) ? $user->addresses : (json_decode($user->addresses, true) ?? []);

        return response()->json($userData);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Error updating user: ' . $e->getMessage());
        return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
    }
}

    public function updateCards(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'cards' => 'required|array',
            'cards.*.number' => 'required|string|min:12|regex:/^[0-9\s]*$/',
            'cards.*.expiry' => 'required|string',
            'cards.*.cvv' => 'nullable|string',
            'cards.*.type' => 'nullable|string',
            'cards.*.last_four' => 'nullable|string',
        ]);

        // Ensure existing cards is an array
        $existingCards = is_array($user->cards) ? $user->cards : (json_decode($user->cards, true) ?? []);
        \Log::info('Existing cards:', ['cards' => $existingCards]);
        \Log::info('New cards:', ['cards' => $validated['cards']]);

        // Normalize and filter valid existing card numbers
        $existingCardNumbers = array_filter(
            array_map(function ($card) {
                $number = isset($card['number']) ? preg_replace('/\s+/', '', $card['number']) : '';
                // Exclude invalid numbers (e.g., masked or empty)
                return (strlen($number) >= 12 && preg_match('/^[0-9]+$/', $number)) ? $number : null;
            }, $existingCards),
            fn($number) => !is_null($number)
        );

        // Check for duplicates
        foreach ($validated['cards'] as $newCard) {
            $newCardNumber = preg_replace('/\s+/', '', $newCard['number']);
            if (in_array($newCardNumber, $existingCardNumbers)) {
                \Log::warning('Duplicate card number detected:', ['number' => $newCardNumber]);
                return response()->json(['message' => 'Card number already exists'], 422);
            }
        }

        // Merge new cards with existing ones
        $user->cards = array_merge($existingCards, $validated['cards']);
        $user->save();

        return response()->json(['message' => 'Cards updated successfully']);
    }
    public function getWallet()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        return response()->json(['wallet' => $user->wallet]);
    }

    public function addFunds(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $user->wallet += $validated['amount'];
        $user->save();

        return response()->json(['wallet' => $user->wallet]);
    }

    public function withdrawFunds(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        if ($user->wallet < $validated['amount']) {
            return response()->json(['message' => 'Insufficient funds'], 400);
        }

        $user->wallet -= $validated['amount'];
        $user->save();

        return response()->json(['wallet' => $user->wallet]);
    }

    public function changePassword(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'current_password' => 'required|string|min:6',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function logout(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->tokens()->delete();
        }
        return response()->json(['message' => 'Logged out successfully']);
    }
}
