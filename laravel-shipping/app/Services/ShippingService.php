<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ShippingService
{
    /**
     * Hitung ongkos kirim dari Origin (Tlogomas, Kota Malang - 65144)
     * menggunakan REST API Biteship (Kurir: JNE, J&T, SiCepat - Reguler & Next Day).
     */
    public function calculateRates(int $destinationPostalCode, array $cartItems): array
    {
        $originPostalCode = (int) config('shipping.origin.postal_code', 65144);
        $couriers         = implode(',', config('shipping.couriers', ['jne', 'jnt', 'sicepat']));
        $baseUrl          = rtrim(config('shipping.base_url'), '/');
        $apiKey           = config('shipping.api_key');
        $timeout          = (int) config('shipping.timeout', 10);

        // Hitung total berat dinamis dari item keranjang (berat_gram * qty)
        $totalWeightGrams = 0;
        $biteshipItems    = [];

        foreach ($cartItems as $item) {
            $weightGrams = max(1, (int) ($item['weight'] ?? 500));
            $qty         = max(1, (int) ($item['quantity'] ?? 1));
            $price       = max(0, (int) ($item['price'] ?? 10000));

            $totalWeightGrams += ($weightGrams * $qty);

            $biteshipItems[] = [
                'name'     => $item['name'] ?? 'Produk Alat Kopi',
                'value'    => $price,
                'weight'   => $weightGrams, // Satuan gram
                'quantity' => $qty,
            ];
        }

        if ($totalWeightGrams <= 0) {
            $totalWeightGrams = 500;
        }

        try {
            $response = Http::timeout($timeout)
                ->withHeaders([
                    'Authorization' => $apiKey,
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/json',
                ])
                ->post("{$baseUrl}/rates/couriers", [
                    'origin_postal_code'      => $originPostalCode,
                    'destination_postal_code' => $destinationPostalCode,
                    'couriers'                => $couriers,
                    'items'                   => $biteshipItems,
                ]);

            if ($response->failed()) {
                Log::warning('Biteship API Error Response', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                return [
                    'success' => false,
                    'message' => 'Layanan cek ongkir sedang sibuk. Silakan coba beberapa saat lagi.',
                ];
            }

            $json    = $response->json();
            $pricing = $json['pricing'] ?? [];

            // Filter layanan Reguler & Next Day dari JNE, J&T, dan SiCepat
            $allowedServices = ['reg', 'yes', 'ez', 'siunt', 'best', 'reguler', 'next_day'];
            $rates           = [];

            foreach ($pricing as $rate) {
                $serviceCode = strtolower($rate['courier_service_code'] ?? '');
                $serviceType = strtolower($rate['shipment_duration_range'] ?? '');

                if (in_array($serviceCode, $allowedServices, true) || str_contains($serviceCode, 'reg') || str_contains($serviceCode, 'best') || str_contains($serviceCode, 'yes') || str_contains($serviceCode, 'ez')) {
                    $rates[] = [
                        'courier_code' => strtolower($rate['courier_code'] ?? ''),
                        'courier_name' => $rate['courier_name'] ?? strtoupper($rate['courier_code'] ?? ''),
                        'service_code' => strtoupper($rate['courier_service_code'] ?? 'REG'),
                        'service_name' => $rate['courier_service_name'] ?? 'Layanan Reguler',
                        'etd'          => ($rate['shipment_duration_range'] ?? '1 - 3') . ' ' . ($rate['shipment_duration_unit'] ?? 'Hari'),
                        'price'        => (int) ($rate['price'] ?? 0),
                    ];
                }
            }

            return [
                'success'            => true,
                'origin_postal_code' => $originPostalCode,
                'total_weight_grams' => $totalWeightGrams,
                'billed_weight_kg'   => max(1, (int) ceil($totalWeightGrams / 1000)),
                'rates'              => $rates,
            ];
        } catch (Throwable $e) {
            Log::error('Biteship API Exception / Timeout', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Koneksi ke server ekspedisi timeout. Mohon periksa koneksi atau coba lagi.',
            ];
        }
    }
}

