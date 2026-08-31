import { useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nik: '',
        whatsapp: '',
        email: '',
        password: '',
        role: 'Warga (Resident)',
    });

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const handleNikChange = (e) => {
        const value = e.target.value;
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length <= 16) {
            setData('nik', cleanValue);
        }
    };

    const handleWhatsappChange = (e) => {
        const value = e.target.value;
        const cleanValue = value.replace(/\D/g, '');
        
        // Batasi maksimal 13 digit untuk nomor HP Indonesia
        if (cleanValue.length <= 13) {
            setData('whatsapp', cleanValue);
        }
    };

    return (
        <GuestLayout
            image="registerr.png"
            title="Bergabung dengan Komunitas Digital RT 05"
            subtitle="Wujudkan modern gotong royong dengan sistem manajemen warga yang transparan dan efisien. Pantau iuran, lapor kendala, dan terima berita terbaru hanya dalam satu genggaman."
        >
            <Head title="Buat Akun Warga" />

            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

            <div className="mb-8">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                    Buat Akun Warga
                </h1>
                <p className="text-base text-gray-500">
                    Lengkapi data diri Anda untuk mengakses fitur sistem.
                </p>
            </div>

            <div className="mb-6">
                <a
                    href={route('auth.google')}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-3.5 rounded-xl font-medium text-sm hover:bg-gray-50 hover:border-[#006948] transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.49 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.44c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.31 14.33c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.68H1.3A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.3 5.32z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.68l4.01 3.09c.94-2.82 3.58-4.92 6.69-4.92z"/>
                    </svg>
                    Register with Google
                </a>
            </div>

            <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Atau Daftar Manual
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="name" className="text-sm font-medium text-gray-600 px-1">Nama Lengkap</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                                person
                            </span>
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="nama lengkap"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0 placeholder:text-gray-300"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="nik" className="text-sm font-medium text-gray-600 px-1">NIK (KTP)</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                                badge
                            </span>
                            <TextInput
                                id="nik"
                                type="text"
                                name="nik"
                                value={data.nik}
                                placeholder="16 digit nomor KTP"
                                minLength={16}
                                maxLength={16}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0 placeholder:text-gray-300"
                                onChange={handleNikChange}
                                required
                            />
                        </div>
                        <InputError message={errors.nik} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="whatsapp" className="text-sm font-medium text-gray-600 px-1">Nomor WhatsApp</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                                call
                            </span>
                            <TextInput
                                id="whatsapp"
                                type="text"
                                name="whatsapp"
                                value={data.whatsapp}
                                placeholder="0812xxxx"
                                minLength={10}
                                maxLength={13}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0 placeholder:text-gray-300"
                                onChange={handleWhatsappChange}
                                required
                            />
                        </div>
                        <InputError message={errors.whatsapp} />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-gray-600 px-1">Email</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                                mail
                            </span>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="contoh@email.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0 placeholder:text-gray-300"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-600 px-1">Password</label>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                            lock
                        </span>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="Min. 8 karakter"
                            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0 placeholder:text-gray-300"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 select-none cursor-pointer"
                        >
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Catatan Privasi Pengurus */}
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#006948] text-[20px] mt-0.5">
                        policy
                    </span>
                    <p className="text-xs leading-relaxed text-gray-600">
                        <strong className="text-[#006948]">Privasi Terjaga:</strong> Data pribadi Anda (termasuk NIK, Email, dan No. WhatsApp) dienkripsi dengan aman dan hanya dapat diakses oleh Pengurus RT resmi untuk keperluan administrasi lingkungan.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-[#006948] text-white py-4 rounded-xl font-semibold text-sm shadow-lg shadow-[#006948]/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                    {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                </button>

                <p className="text-center text-sm text-gray-500 pt-2">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="text-[#006948] font-bold hover:underline transition-all">
                        Login di sini
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}