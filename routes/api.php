<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\PolicyPagesController;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

Route::prefix('admin')->middleware('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login.submit');
    Route::middleware(['admin'])->withoutMiddleware('throttle')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/user', [AdminAuthController::class, 'user']);
        Route::get('/dashboard-data', [AdminDashboardController::class, 'dashboardData'])->name('admin.dashboard.data');
        Route::get('/categories', [CategoryController::class, 'adminIndex'])->name('admin.categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('admin.categories.store');
        Route::get('/categories/{id}', [CategoryController::class, 'show'])->name('admin.categories.show');
        Route::put('/categories/{id}', [CategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');
        // Product Routes
        Route::get('/products', [ProductController::class, 'adminIndex'])->name('admin.products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('admin.products.store');
        Route::get('/products/{id}', [ProductController::class, 'show'])->name('admin.products.show');
        Route::put('/products/{id}', [ProductController::class, 'update'])->name('admin.products.update');
        Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('admin.products.destroy');
        Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('admin.users.show');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');


        // Order Routes
        Route::get('/orders', [OrderController::class, 'index'])->name('admin.orders.index');
        Route::get('/orders/{id}', [OrderController::class, 'show'])->name('admin.orders.show');
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.updateStatus');
        Route::put('/orders/{id}/payment-status', [OrderController::class, 'updatePaymentStatus'])->name('admin.orders.updatePaymentStatus');
        Route::delete('/orders/{id}', [OrderController::class, 'destroy'])->name('admin.orders.destroy');
        // Promotions Routes
        Route::get('/promotions', [PromotionController::class, 'index']);
    Route::post('/promotions', [PromotionController::class, 'store']);
    Route::get('/promotions/{id}', [PromotionController::class, 'show']);
    Route::put('/promotions/{id}', [PromotionController::class, 'update']);
    Route::delete('/promotions/{id}', [PromotionController::class, 'destroy']);
    Route::get('/settings/{section}', [SettingsController::class, 'getSettings']);
    Route::post('/settings/{section}', [SettingsController::class, 'updateSettings']);
    Route::post('/policy_pages', [PolicyPagesController::class, 'store']);
    Route::get('/policy_pages', [PolicyPagesController::class, 'index']);


    });
});

Route::middleware('auth:sanctum')->withoutMiddleware('throttle')->group(function () {
    // Public routes

Route::get('/policy_pages/{type}', [PolicyPagesController::class, 'show']);

// Protected route

    Route::get('/user', [UserController::class, 'show'])->name('user.show');

    Route::get('/user/me', [UserController::class, 'me']);
    Route::post('/user/update', [UserController::class, 'update'])->name('user.update');
    Route::put('/user/update/{id}', [UserController::class, 'update']);
    Route::post('/user/update/{id}', [UserController::class, 'update']);
    Route::post('/user/update-cards', [UserController::class, 'updateCards'])->name('user.updateCards');
    Route::post('/user/add-funds', [UserController::class, 'addFunds'])->name('user.addFunds');
    Route::post('/user/withdraw-funds', [UserController::class, 'withdrawFunds'])->name('user.withdrawFunds');
    Route::post('/user/addresses', [UserController::class, 'storeAddress'])->name('user.addresses.store');
    Route::put('/user/addresses/{id}', [UserController::class, 'updateAddress'])->name('user.addresses.update');
    Route::delete('/user/addresses/{id}', [UserController::class, 'destroyAddress'])->name('user.addresses.destroy');
    Route::get('/user/wallet', [UserController::class, 'getWallet'])->name('user.wallet');
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/user/orders', [OrderController::class, 'userOrders']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::get('/user/orders/{id}/status-history', [OrderController::class, 'getStatusHistory']);
    Route::post('/promotions/validate', [PromotionController::class, 'validatePromoCode']);
});


// Public routes for categories and products
Route::get('/products/{id}/related', [ProductController::class, 'related']);
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');
Route::post('/login', [UserController::class, 'login']);
Route::post('/promotions/validate', [PromotionController::class, 'validatePromoCode']);
Route::post('/register', [UserController::class, 'register']);


