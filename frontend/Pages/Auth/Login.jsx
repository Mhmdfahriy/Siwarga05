import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        return () => reset('password');
    }, []);

    // 1. Cek localStorage saat halaman dimuat/di-refresh
    useEffect(() => {
        const storedUnlockTime = localStorage.getItem('login_unlock_time');
        if (storedUnlockTime) {
            const remainingTime = Math.ceil((parseInt(storedUnlockTime, 10) - Date.now()) / 1000);
            if (remainingTime > 0) {
                setCountdown(remainingTime);
            } else {
                localStorage.removeItem('login_unlock_time');
            }
        }
    }, []);

    // 2. Tangkap error 60 detik dari backend dan set localStorage
    useEffect(() => {
        if (errors.email) {
            const match = errors.email.match(/dalam (\d+) detik/);
            if (match) {
                const seconds = parseInt(match[1], 10);
                setCountdown(seconds);
                
                const unlockTime = Date.now() + seconds * 1000;
                localStorage.setItem('login_unlock_time', unlockTime.toString());
            }
        }
    }, [errors.email]);

    // 3. Jalankan interval hitung mundur
    useEffect(() => {
        if (countdown <= 0) {
            localStorage.removeItem('login_unlock_time');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev > 1) {
                    return prev - 1;
                } else {
                    localStorage.removeItem('login_unlock_time');
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <GuestLayout
            image="login.jpg"
            title="Siwarga05"
            subtitle="Digitalisasi gotong royong untuk lingkungan yang lebih aman, nyaman, dan transparan."
        >
            <Head title="Login" />

            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <div className="mb-8">
                <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight leading-tight mb-2">
                    Selamat Datang Kembali
                </h1>
                <p className="text-base text-gray-500">
                    Masuk ke akun Siwarga05 Anda
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-[#006948]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-1">
                    <InputLabel htmlFor="email" value="Email atau Nomor Telepon" className="px-1 text-gray-500 font-medium text-sm" />
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                            person
                        </span>
                        <TextInput
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            placeholder="contoh@email.com atau 08123456789"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    {countdown > 0 ? (
                        <p className="mt-2 text-sm text-red-600">
                            Terlalu banyak percobaan login. Coba lagi dalam {countdown} detik.
                        </p>
                    ) : (
                        <InputError message={errors.email} className="mt-2" />
                    )}
                </div>

                <div className="space-y-1">
                    <InputLabel htmlFor="password" value="Kata Sandi" className="px-1 text-gray-500 font-medium text-sm" />
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                            lock
                        </span>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-4 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#006948] transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-[#006948] focus:ring-[#006948]/20 transition-all"
                        />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
                            Tetap masuk
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-[#006948] hover:text-[#005137] transition-colors"
                        >
                            Lupa kata sandi?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing || countdown > 0}
                    className="w-full bg-[#006948] text-white py-4 rounded-xl font-medium text-sm shadow-lg shadow-[#006948]/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                    {countdown > 0 ? (
                        `Coba lagi dalam ${countdown} detik`
                    ) : processing ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menghubungkan...
                        </>
                    ) : (
                        'Masuk Sekarang'
                    )}
                </button>

                <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Atau
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <a
                    href={route('auth.google')}
                    className="w-full bg-white border border-gray-300 text-gray-600 py-4 rounded-xl font-medium text-sm hover:bg-gray-50 hover:border-[#006948] transition-all duration-200 flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.49 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.44c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
                        <path fill="#FBBC05" d="M5.31 14.33c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.68H1.3A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.3 5.32z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.68l4.01 3.09c.94-2.82 3.58-4.92 6.69-4.92z" />
                    </svg>
                    Masuk dengan Google
                </a>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link href={route('register')} className="text-[#006948] font-bold hover:underline transition-all">
                    Daftar di sini
                </Link>
            </p>
        </GuestLayout>
    );
}