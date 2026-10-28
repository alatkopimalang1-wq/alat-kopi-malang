<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi REST API Biteship & Origin Toko (Tlogomas, Kota Malang)
    |--------------------------------------------------------------------------
    */
    'driver'   => env('SHIPPING_DRIVER', 'biteship'),
    'api_key'  => env('BITESHIP_API_KEY', ''),
    'base_url' => env('BITESHIP_BASE_URL', 'https://api.biteship.com/v1'),
    'timeout'  => (int) env('BITESHIP_TIMEOUT', 10),

    // Lokasi Asal Toko (Kecamatan Tlogomas, Kota Malang, Jawa Timur 65144)
    'origin' => [
        'subdistrict' => env('SHIPPING_ORIGIN_SUBDISTRICT', 'Tlogomas, Kec. Lowokwaru'),
        'city'        => env('SHIPPING_ORIGIN_CITY', 'Kota Malang'),
        'province'    => env('SHIPPING_ORIGIN_PROVINCE', 'Jawa Timur'),
        'postal_code' => (int) env('SHIPPING_ORIGIN_POSTAL_CODE', 65144),
    ],

    // Pilihan Kurir Aktif (JNE, J&T, SiCepat)
    'couriers' => ['jne', 'jnt', 'sicepat'],
];

