<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->where('active', true);

        // Handle search parameter
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('name_ar', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('description', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('description_ar', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        // Handle category parameter
        if ($request->has('category') && !empty($request->category)) {
            $categoryName = $request->category;
            $query->whereHas('category', function($q) use ($categoryName) {
                $q->where('name', $categoryName)
                  ->orWhere('name_ar', $categoryName);
            });
        }

        // Handle sort parameter
        $sortOption = $request->get('sort', 'Best Selling');
        switch ($sortOption) {
            case 'Price Low to High':
                $query->orderBy('price', 'asc');
                break;
            case 'Price High to Low':
                $query->orderBy('price', 'desc');
                break;
            case 'Best Selling':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $products = $query->get();
        return response()->json($products);
    }

    public function adminIndex()
    {
        $products = Product::with('category')->get();
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'ingredients_material' => 'nullable|string',
            'ingredients_material_ar' => 'nullable|string',
            'instructions' => 'nullable|string',
            'instructions_ar' => 'nullable|string',
            'weight_dimensions' => 'nullable|string',
            'weight_dimensions_ar' => 'nullable|string',
            'return_policy' => 'nullable|string',
            'return_policy_ar' => 'nullable|string',
            'active' => 'required|boolean',
        ]);

        // Handle featured image
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }

        // Handle gallery images
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $galleryImage) {
                $path = $galleryImage->store('products', 'public');
                $galleryPaths[] = $path;
            }
        }
        $validated['gallery_images'] = $galleryPaths;

        $product = Product::create($validated);
        return response()->json($product->load('category'), 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'ingredients_material' => 'nullable|string',
            'ingredients_material_ar' => 'nullable|string',
            'instructions' => 'nullable|string',
            'instructions_ar' => 'nullable|string',
            'weight_dimensions' => 'nullable|string',
            'weight_dimensions_ar' => 'nullable|string',
            'return_policy' => 'nullable|string',
            'return_policy_ar' => 'nullable|string',
            'active' => 'required|boolean',
        ]);

        // Handle featured image
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        } else {
            $validated['image'] = $product->image;
        }

        // Handle gallery images
        $galleryPaths = $product->gallery_images ?? [];
        if ($request->hasFile('gallery_images')) {
            // Delete existing gallery images if replaced
            foreach ($galleryPaths as $existingImage) {
                Storage::disk('public')->delete($existingImage);
            }
            $galleryPaths = [];
            foreach ($request->file('gallery_images') as $galleryImage) {
                $path = $galleryImage->store('products', 'public');
                $galleryPaths[] = $path;
            }
        }
        $validated['gallery_images'] = $galleryPaths;

        $product->update($validated);
        return response()->json($product->load('category'));
    }

    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    public function related($id)
    {
        $product = Product::findOrFail($id);
        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $id)
            ->where('active', true)
            ->with('category')
            ->take(4)
            ->get();
        return response()->json($related);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    public function batch(Request $request)
    {
        $request->validate([
            'ids' => 'required|string',
        ]);

        $ids = explode(',', $request->query('ids'));

        $sanitizedIds = array_map('intval', $ids);

        $products = Product::whereIn('id', $sanitizedIds)->where('active', true)->get();

        return response()->json($products);
    }
}
