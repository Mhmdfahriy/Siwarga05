<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RoleUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@siwarga05.com'],
            [
                'name' => 'Super Admin',
                'no_hp' => '081200000000',
                'nik' => '3201010101010000',
                'password' => bcrypt('Admin123'),
                'role' => User::ROLE_SUPER_ADMIN,
                'status' => User::STATUS_AKTIF,
            ]
        );

        User::updateOrCreate(
            ['email' => 'ketuart@siwarga05.com'],
            [
                'name' => 'Ketua RT',
                'no_hp' => '081200000001',
                'nik' => '3201010101010001',
                'password' => bcrypt('ketuart123'),
                'role' => User::ROLE_KETUA_RT,
                'status' => User::STATUS_AKTIF,
            ]
        );

        User::updateOrCreate(
            ['email' => 'sekretaris@siwarga05.com'],
            [
                'name' => 'Sekretaris',
                'no_hp' => '081200000002',
                'nik' => '3201010101010002',
                'password' => bcrypt('sekretaris123'),
                'role' => User::ROLE_SEKRETARIS,
                'status' => User::STATUS_AKTIF,
            ]
        );

        User::updateOrCreate(
            ['email' => 'bendahara@siwarga05.com'],
            [
                'name' => 'Bendahara',
                'no_hp' => '081200000003',
                'nik' => '3201010101010003',
                'password' => bcrypt('bendahara123'),
                'role' => User::ROLE_BENDAHARA,
                'status' => User::STATUS_AKTIF,
            ]
        );

        User::updateOrCreate(
            ['email' => 'ilham@siwarga05.com'],
            [
                'name' => 'Ilham',
                'no_hp' => '081202752004',
                'nik' => '32065466454610004',
                'password' => bcrypt('ilham123'),
                'role' => User::ROLE_WARGA,
                'status' => User::STATUS_AKTIF,
            ]
        );
    }
}