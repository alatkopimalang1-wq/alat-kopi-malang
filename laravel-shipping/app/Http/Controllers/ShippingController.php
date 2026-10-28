<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(protected ShippingService $shippingService)
    {
    }

    /**
     * Endpoint AJAX: POST /api/shipping/calculate-cost
     */
    public function calculateCost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination_postal_code' => ['required', 'digits:5'],
            'province'                => ['nullable', 'string'],
            'city'                    => ['nullable', 'string'],
            'district'                => ['nullable', 'string'],
            'items'                   => ['nullable', 'array'],
            'items.*.weight'          => ['nullable', 'numeric', 'min:1'],
            'items.*.quantity'        => ['nullable', 'integer', 'min:1'],
        ]);

        // Ambil item dari session keranjang Laravel atau dari payload request
        $cartItems = session('cart', $validated['items'] ?? []);

        $result = $this->shippingService->calculateRates(
            (int) $validated['destination_postal_code'],
            $cartItems
        );

        if (!$result['success']) {
            return response()->json($result, 503);
        }

        return response()->json($result);
    }

    /**
     * Simpan pesanan beserta kurir terpilih & ongkir ke tabel `orders`
     */
    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'customer_name'           => ['required', 'string', 'max:120'],
            'customer_phone'          => ['required', 'string', 'max:30'],
            'destination_province'    => ['required', 'string', 'max:100'],
            'destination_city'        => ['required', 'string', 'max:100'],
            'destination_district'    => ['required', 'string', 'max:100'],
            'destination_postal_code' => ['required', 'digits:5'],
            'shipping_address'        => ['required', 'string'],
            'courier_code'            => ['required', 'in:jne,jnt,sicepat'],
            'courier_service'         => ['required', 'string', 'max:60'],
            'shipping_etd'            => ['nullable', 'string', 'max:40'],
            'shipping_cost'           => ['required', 'numeric', 'min:0'],
            'total_weight_grams'      => ['required', 'integer', 'min:1'],
            'subtotal'                => ['required', 'numeric', 'min:0'],
        ]);

        $grandTotal = (int) $validated['subtotal'] + (int) $validated['shipping_cost'];

        $order = Order::create([
            'order_number'            => 'ORD-' . random_int(100000, 999999),
            'customer_name'           => $validated['customer_name'],
            'customer_phone'          => $validated['customer_phone'],
            'destination_province'    => $validated['destination_province'],
            'destination_city'        => $validated['destination_city'],
            'destination_district'    => $validated['destination_district'],
            'destination_postal_code' => $validated['destination_postal_code'],
            'shipping_address'        => $validated['shipping_address'],
            'courier_code'            => $validated['courier_code'],
            'courier_service'         => $validated['courier_service'],
            'shipping_etd'            => $validated['shipping_etd'] ?? null,
            'total_weight_grams'      => $validated['total_weight_grams'],
            'subtotal'                => $validated['subtotal'],
            'shipping_cost'           => $validated['shipping_cost'],
            'grand_total'             => $grandTotal,
            'status'                  => 'Menunggu Pembayaran',
        ]);

        return redirect()->route('checkout.finish', ['orderId' => $order->order_number]);
    }
}

