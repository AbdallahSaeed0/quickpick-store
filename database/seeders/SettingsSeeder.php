<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            // Banner
            ['section' => 'banner', 'key' => 'title', 'value' => 'Make healthy life with Fresh Grocery. Product.', 'language' => 'en'],
            ['section' => 'banner', 'key' => 'title', 'value' => 'عش حياة صحية مع منتجات البقالة الطازجة.', 'language' => 'ar'],
            ['section' => 'banner', 'key' => 'title_highlight', 'value' => 'Fresh Grocery.', 'language' => 'en'],
            ['section' => 'banner', 'key' => 'title_highlight', 'value' => 'البقالة الطازجة.', 'language' => 'ar'],
            ['section' => 'banner', 'key' => 'subtitle', 'value' => 'Enter a product name to see what we deliver', 'language' => 'en'],
            ['section' => 'banner', 'key' => 'subtitle', 'value' => 'أدخل اسم المنتج لمعرفة ما نقدمه', 'language' => 'ar'],
            ['section' => 'banner', 'key' => 'banner_image_en', 'value' => '', 'language' => 'en', 'image' => 'banners/home-banner.21f58fbba2c173ba2aee.png'],
            ['section' => 'banner', 'key' => 'banner_image_ar', 'value' => '', 'language' => 'ar', 'image' => 'banners/home-banner.21f58fbba2c173ba2aee.png'],
            // PromoSection
            ['section' => 'promo_section', 'key' => 'cooking_ideas_badge', 'value' => 'Looking for cooking ideas?', 'language' => 'en'],
            ['section' => 'promo_section', 'key' => 'cooking_ideas_badge', 'value' => 'هل تبحث عن أفكار للطبخ؟', 'language' => 'ar'],
            ['section' => 'promo_section', 'key' => 'cooking_ideas_title', 'value' => "We're here to help you save with no fees!", 'language' => 'en'],
            ['section' => 'promo_section', 'key' => 'cooking_ideas_title', 'value' => 'نحن هنا لمساعدتك على التوفير بدون رسوم!', 'language' => 'ar'],
            ['section' => 'promo_section', 'key' => 'cooking_ideas_image', 'value' => '', 'language' => 'en', 'image' => 'banners/cooking-ideas.jpg'],
            ['section' => 'promo_section', 'key' => 'fast_delivery_badge', 'value' => 'Need groceries ASAP?', 'language' => 'en'],
            ['section' => 'promo_section', 'key' => 'fast_delivery_badge', 'value' => 'هل تحتاج إلى البقالة بسرعة؟', 'language' => 'ar'],
            ['section' => 'promo_section', 'key' => 'fast_delivery_title', 'value' => "With QuickPick's lightning-fast delivery, your essentials arrive at your doorstep in no time—fresh, reliable, and hassle-free!", 'language' => 'en'],
            ['section' => 'promo_section', 'key' => 'fast_delivery_title', 'value' => 'مع التوصيل السريع من QuickPick، ستصل احتياجاتك إلى باب منزلك في وقت قصير—طازجة، موثوقة، وبدون متاعب!', 'language' => 'ar'],
            ['section' => 'promo_section', 'key' => 'fast_delivery_image', 'value' => '', 'language' => 'en', 'image' => 'banners/fast-delivery.jpg'],
            // Search Slider
            ['section' => 'search_slider', 'key' => 'slide_1_title', 'value' => 'Glow with Unstoppable Beauty!', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_1_title', 'value' => 'تألقي بجمال لا يُضاهى!', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_1_text', 'value' => 'The Countdown is on! Grab the best deals while stock lasts.', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_1_text', 'value' => 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_1_button_text', 'value' => 'Order Now', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_1_button_text', 'value' => 'اطلب الآن', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_1_image', 'value' => '', 'language' => 'en', 'image' => 'settings/search_slider/offer-banner1.jpeg'],
            ['section' => 'search_slider', 'key' => 'slide_2_title', 'value' => 'Save Up to 60% Off the Grocery Deals!', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_2_title', 'value' => 'وفر حتى 60% على عروض البقالة!', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_2_text', 'value' => 'The Countdown is on! Grab the best deals while stock lasts.', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_2_text', 'value' => 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_2_button_text', 'value' => 'Order Now', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_2_button_text', 'value' => 'اطلب الآن', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_2_image', 'value' => '', 'language' => 'en', 'image' => 'settings/search_slider/offer-banner2.jpeg'],
            ['section' => 'search_slider', 'key' => 'slide_3_title', 'value' => 'A Sparkling Homeware Deal!', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_3_title', 'value' => 'عرض رائع للأدوات المنزلية!', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_3_text', 'value' => 'The Countdown is on! Grab the best deals while stock lasts.', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_3_text', 'value' => 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_3_button_text', 'value' => 'Order Now', 'language' => 'en'],
            ['section' => 'search_slider', 'key' => 'slide_3_button_text', 'value' => 'اطلب الآن', 'language' => 'ar'],
            ['section' => 'search_slider', 'key' => 'slide_3_image', 'value' => '', 'language' => 'en', 'image' => 'settings/search_slider/offer-banner3.jpeg'],
        ];
        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
