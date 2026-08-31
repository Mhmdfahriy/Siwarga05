import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout
            image="lupa-password.png"
            title="Siwarga05"
            subtitle="Digitalisasi gotong royong untuk lingkungan yang lebih aman, nyaman, dan transparan."
        >
            <Head title="Lupa Kata Sandi" />

            {/* Load Material Symbols untuk Icon */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

            {/* Header / Judul sesuai Mockup */}
            <div className="mb-10">
                <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight leading-tight mb-2">
                    Lupa Kata Sandi?
                </h1>
                <p className="text-base text-gray-500 leading-relaxed">
                    Masukkan email atau nomor telepon yang terdaftar untuk menerima tautan atur ulang kata sandi.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-[#006948]">
                    {status}
                </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="space-y-6">
                
                {/* Input Field */}
                <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 px-1">
                        Email atau Nomor Telepon
                    </label>
                    <div className="relative group">
                        {/* Icon Amplop Surat */}
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006948] transition-colors">
                            mail
                        </span>
                        <TextInput
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            placeholder="name@example.com / 0812..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl transition-all focus:border-[#006948] focus:ring-0 placeholder:text-gray-300"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Tombol Utama Kirim Tautan */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-[#006948] text-white py-4 rounded-xl font-semibold text-sm shadow-lg shadow-[#006948]/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                    {processing ? 'Mengirim...' : 'Kirim Link Atur Ulang'}
                </button>

                {/* Tombol Kembali ke Login */}
                <div className="flex justify-center pt-2">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#006948] hover:text-[#005137] transition-all border border-dashed border-transparent hover:border-[#006948] px-2 py-1 rounded"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Kembali ke Login
                    </Link>
                </div>

                {/* Divider Line tipis di bawah menu kembali */}
                <div className="border-t border-gray-200/60 my-6" />

                {/* Footer Link Registrasi */}
                <p className="text-center text-sm text-gray-500">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="text-[#006948] font-bold hover:underline transition-all">
                        Daftar Sekarang
                    </Link>
                </p>

            </form>
        </GuestLayout>
    );
}