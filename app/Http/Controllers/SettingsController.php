<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    public function getSettings($section)
    {
        $settings = Setting::where('section', $section)->get();
        Log::info('Fetched settings for section ' . $section . ': ' . json_encode($settings));
        return response()->json($settings);
    }

    public function updateSettings(Request $request, $section)
    {
        // Prepare validation rules dynamically
        $rules = [
            '*.key' => 'required|string',
            '*.value' => 'required',
            '*.language' => 'required|in:en,ar',
        ];

        // Add image validation rules for any uploaded images
        foreach ($request->all() as $key => $value) {
            if (str_contains($key, '.image')) {
                $rules[$key] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048';
            }
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            Log::error('Validation errors for section ' . $section . ': ' . json_encode($validator->errors()));
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        Log::info('Request data for section ' . $section . ': ' . json_encode($data));

        foreach ($data as $index => $item) {
            Log::info('Processing item: ' . $item['key'] . ', value: ' . $item['value'] . ', language: ' . $item['language']);

            // Find the existing setting, if it exists
            $setting = Setting::where([
                'section' => $section,
                'key' => $item['key'],
                'language' => $item['language'],
            ])->first();

            // Prepare the data to update or create
            $updateData = [
                'section' => $section,
                'key' => $item['key'],
                'language' => $item['language'],
                'value' => $item['value'],
            ];

            // If the setting exists, preserve the existing image unless a new one is provided
            if ($setting && isset($setting->image)) {
                $updateData['image'] = $setting->image; // Preserve the existing image
            }

            // Update or create the setting
            $setting = Setting::updateOrCreate(
                [
                    'section' => $section,
                    'key' => $item['key'],
                    'language' => $item['language'],
                ],
                $updateData
            );

            // Check if an image file was uploaded for this specific item
            $imageFieldName = $index . '.image';
            if ($request->hasFile($imageFieldName) && !str_ends_with($item['key'], '_products')) {
                $imageFile = $request->file($imageFieldName);
                Log::info('Processing image file for ' . $item['key']);

                // Delete the old image if it exists
                if ($setting->image) {
                    Storage::disk('public')->delete($setting->image);
                    Log::info('Deleted old image: ' . $setting->image);
                }

                // Store the new image
                $path = $imageFile->store('settings', 'public');
                $setting->image = $path;
                $setting->save();
                Log::info('Image updated for ' . $item['key'] . ': ' . $path);
            }
        }

        Log::info('Settings updated successfully for section ' . $section);
        return response()->json(['message' => 'Settings updated successfully']);
    }
}
