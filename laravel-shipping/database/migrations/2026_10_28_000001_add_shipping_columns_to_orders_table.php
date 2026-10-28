<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('destination_province', 100)->nullable()->after('customer_phone');
            $table->string('destination_city', 100)->nullable()->after('destination_province');
            $table->string('destination_district', 100)->nullable()->after('destination_city');
            $table->string('destination_postal_code', 10)->nullable()->after('destination_district');
            $table->string('courier_code', 30)->nullable()->after('shipping_address');    // jne, jnt, sicepat
            $table->string('courier_service', 60)->nullable()->after('courier_code');     // REG, YES, EZ, SIUNT, BEST
            $table->string('shipping_etd', 40)->nullable()->after('courier_service');     // Estimasi: 1 - 3 Hari
            $table->unsignedInteger('total_weight_grams')->default(500)->after('shipping_etd');
            $table->unsignedBigInteger('shipping_cost')->default(0)->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'destination_province',
                'destination_city',
                'destination_district',
                'destination_postal_code',
                'courier_code',
                'courier_service',
                'shipping_etd',
                'total_weight_grams',
                'shipping_cost',
            ]);
        });
    }
};

