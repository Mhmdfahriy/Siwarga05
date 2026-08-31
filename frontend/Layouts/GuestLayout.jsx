import { Link } from '@inertiajs/react';

export default function GuestLayout({
    children,
    image = 'login.jpg', 
    title = 'Bersama Membangun Lingkungan yang Lebih Baik',
    subtitle = 'Siwarga05 hadir untuk memudahkan komunikasi, informasi, dan layanan di lingkungan RT 05.',
}) {
    return (
        <div className="min-h-screen flex w-full bg-white font-sans antialiased">

            {/* SISI KIRI: Bagian Ilustrasi (Putih Bersih) */}
            <section className="hidden lg:flex lg:w-1/2 relative bg-white flex-col justify-between p-12 overflow-hidden">
                
                {/* Header Logo di Sisi Kiri Atas */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden p-1">
                        <img 
                            src="/images/logort05.png" 
                            alt="Logo RT 05" 
                            className="w-full h-full object-contain scale-125" 
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-[#007b83] tracking-tight leading-tight">SiWarga05</h1>
                        <p className="text-xs text-gray-500">Sistem Informasi Warga RT 05</p>
                    </div>
                </div>

                {/* Kontainer Utama Gambar dan Teks */}
                <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center my-auto py-8">
                    <div className="w-full max-w-md transition-transform duration-700 hover:scale-[1.01]">
                        <img
                            src={`/images/${image}`}
                            alt="Ilustrasi Siwarga05"
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    <div className="mt-10 text-center">
                        <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight text-[#007b83] max-w-sm mx-auto">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 hidden md:block text-xs text-gray-400 text-center">
                    &copy; {new Date().getFullYear()} SiWarga05. All rights reserved.
                </div>
            </section>

            {/* SISI KANAN: Warna Teal Mint Pastel */}
            <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-[#e6f4f0] relative overflow-hidden border-l border-gray-100">
                
                {/* Efek pendaran awan putih halus */}
                <div className="absolute top-0 right-0 w-full h-full opacity-50 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-[440px] relative z-10">
                    
                    {/* Logo Mobile View (Hanya muncul di HP) */}
                    <div className="flex items-center gap-3 justify-center lg:hidden mb-10">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden p-1">
                            <img 
                                src="/images/logort05.png" 
                                alt="Logo RT 05" 
                                className="w-full h-full object-contain scale-125" 
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-[#007b83] tracking-tight">SiWarga05</h1>
                            <p className="text-xs text-gray-500">Sistem Informasi Warga RT 05</p>
                        </div>
                    </div>

                    {/* Form Utama (Children) */}
                    <div className="bg-transparent">
                        {children}
                    </div>
                    
                </div>
            </section>

        </div>
    );
}