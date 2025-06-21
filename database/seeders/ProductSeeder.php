<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run()
    {
        // Create categories and get their IDs
        $beverages = Category::firstOrCreate(['name' => 'Beverages', 'name_ar' => 'مشروبات']);
        $bakery = Category::firstOrCreate(['name' => 'Bakery', 'name_ar' => 'مخبوزات']);
        $fruits = Category::firstOrCreate(['name' => 'Fruits', 'name_ar' => 'فواكه']);

        $products = [
            [
                'name' => 'Orange Juice - Freshly Squeezed',
                'name_ar' => 'عصير برتقال طازج',
                'category_id' => $beverages->id,
                'price' => 45.00,
                'image' => '/assets/products/orange-juice.jpg',
                'active' => true,
                'stock' => 100,
            ],
            [
                'name' => 'Whole Grain Bread',
                'name_ar' => 'خبز الحبوب الكاملة',
                'category_id' => $bakery->id,
                'price' => 30.00,
                'image' => '/assets/products/whole-grain-bread.jpg',
                'active' => true,
                'stock' => 50,
            ],
            [
                'name' => 'Fresh Apples',
                'name_ar' => 'تفاح طازج',
                'category_id' => $fruits->id,
                'price' => 20.00,
                'image' => '/assets/products/apples.jpg',
                'active' => true,
                'stock' => 200,
            ],
        ];

        foreach ($products as $productData) {
            Product::updateOrCreate(['name' => $productData['name']], $productData);
        }
    }
}
