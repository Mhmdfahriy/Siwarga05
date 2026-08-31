import React, { useRef, useState } from 'react';
import { useForm, usePage, Head, router } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import { Eye, EyeOff } from 'lucide-react';
import ModalCard from '@/Components/ModalCard';
import axios from 'axios'; 
import Footer from '@/Components/Footer';

export default function PengaturanIndex({ notificationPreferences, resident_id, has_password, vapid_public_key }) {
    // DITAMBAHKAN: Menangkap vapid_public_key dari props
    const { auth } = usePage().props;
    const { user } = auth;

    const routePrefix = {
        'ketua_rt': 'ketuart',
        'sekretaris': 'sekretaris',
        'bendahara': 'bendahara',
        'warga': 'warga'
    }[user.role] || 'warga';

    const roleLabels = {
        warga: 'Warga RT 05',
        sekretaris: 'Sekretaris RT 05',
        bendahara: 'Bendahara RT 05',
        ketua_rt: 'Ketua RT 05',
        ketuart: 'Ketua RT 05',
    };

    const currentRoleLabel = roleLabels[user.role] || user.role_label || 'Warga RT 05';

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPasswords, setShowNewPasswords] = useState(false);
    const [customErrors, setCustomErrors] = useState({});

    // STATE UNTUK MODAL CARD
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
        confirmText: 'Tutup',
        cancelText: null,
        onConfirm: () => closeModal(),
    });

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    // DITAMBAHKAN: Helper untuk mengubah format VAPID Key untuk Browser
    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    // 1. FORM PROFIL DASAR
    const {
        data: profileData,
        setData: setProfileData,
        post: postProfile,
        processing: profileProcessing,
        errors: profileErrors
    } = useForm({
        name: user.name || '',
        email: user.email || '',
        no_hp: user.no_hp || '',
        occupation: user.occupation || '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        postProfile(route(`${routePrefix}.pengaturan.profil.update`), {
            preserveScroll: true,
            onSuccess: () => {
                setModalConfig({
                    isOpen: true,
                    title: 'Profil Diperbarui',
                    message: 'Informasi pribadi Anda berhasil disimpan.',
                    type: 'success',
                    confirmText: 'Tutup',
                    cancelText: null,
                    onConfirm: closeModal
                });
            }
        });
    };

    // 2. FORM FOTO PROFIL
    const photoInput = useRef();
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setModalConfig({
                    isOpen: true,
                    title: 'Ukuran File Terlalu Besar',
                    message: 'Ukuran foto maksimal yang diizinkan adalah 2MB.',
                    type: 'danger',
                    confirmText: 'Mengerti',
                    cancelText: null,
                    onConfirm: closeModal
                });
                photoInput.current.value = null;
                return;
            }

            if (!file.type.startsWith('image/')) {
                setModalConfig({
                    isOpen: true,
                    title: 'Format File Tidak Sesuai',
                    message: 'Harap unggah file berupa gambar (JPG, PNG).',
                    type: 'danger',
                    confirmText: 'Mengerti',
                    cancelText: null,
                    onConfirm: closeModal
                });
                photoInput.current.value = null;
                return;
            }

            router.post(route(`${routePrefix}.pengaturan.foto.update`), {
                _method: 'post',
                photo: file
            }, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    setModalConfig({
                        isOpen: true,
                        title: 'Foto Diperbarui',
                        message: 'Foto profil Anda berhasil diubah.',
                        type: 'success',
                        confirmText: 'Tutup',
                        cancelText: null,
                        onConfirm: closeModal
                    });
                }
            });
        }
    };

    // 3. FORM PASSWORD
    const {
        data: passData,
        setData: setPassData,
        put: putPassword,
        processing: passProcessing,
        errors: passErrors,
        reset: resetPass
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e) => {
        e.preventDefault();
        setCustomErrors({});

        if (passData.password !== passData.password_confirmation) {
            setCustomErrors({ password_confirmation: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.' });
            return;
        }

        putPassword(route(`${routePrefix}.pengaturan.password.update`), {
            preserveScroll: true,
            onSuccess: () => {
                resetPass();
                setModalConfig({
                    isOpen: true,
                    title: 'Keamanan Diperbarui',
                    message: 'Kata sandi Anda berhasil diperbarui.',
                    type: 'success',
                    confirmText: 'Tutup',
                    cancelText: null,
                    onConfirm: closeModal
                });
            },
        });
    };

    // 4. FORM PREFERENSI (Notifikasi)
    const {
        data: prefData,
        setData: setPrefData,
        put: putPref,
        processing: prefProcessing
    } = useForm({
        notification_preferences: notificationPreferences,
    });

    const submitPreferences = (e) => {
        e.preventDefault();
        putPref(route(`${routePrefix}.pengaturan.preferensi.update`), {
            preserveScroll: true,
            onSuccess: () => {
                setModalConfig({
                    isOpen: true,
                    title: 'Preferensi Disimpan',
                    message: 'Pengaturan notifikasi Anda berhasil diperbarui.',
                    type: 'success',
                    confirmText: 'Tutup',
                    cancelText: null,
                    onConfirm: closeModal
                });
            }
        });
    };

    // DITAMBAHKAN: Fungsi untuk menangani pencentangan Notifikasi Push Web
    const handlePushToggle = async (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
        if (!vapid_public_key) {
            alert("Sistem belum siap: Kunci VAPID tidak ditemukan!");
            e.target.checked = false;
            return;
        }

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapid_public_key)
                    });

                    await axios.post(route(`${routePrefix}.pengaturan.push.subscribe`), subscription);

                    const updatedPrefs = { 
                        ...prefData.notification_preferences, 
                        channels: { ...prefData.notification_preferences.channels, push: true } 
                    };
                    setPrefData('notification_preferences', updatedPrefs);

                    // BARU: langsung persist ke database
                    router.put(route(`${routePrefix}.pengaturan.preferensi.update`), {
                        notification_preferences: updatedPrefs
                    }, { preserveScroll: true });

                    console.log('Berhasil mengaktifkan Web Push!');
                } else {
                    alert("Izin notifikasi diblokir. Klik ikon gembok di dekat URL untuk mengizinkan.");
                    e.target.checked = false;
                }
            } catch (error) {
                console.error('Error saat mendaftar Push Notification:', error);
                alert("Gagal mengaktifkan notifikasi: " + error.message);
                e.target.checked = false;
            }
        } else {
            alert("Browser Anda tidak mendukung Notifikasi Web.");
            e.target.checked = false;
        }
    } else {
        const updatedPrefs = { 
            ...prefData.notification_preferences, 
            channels: { ...prefData.notification_preferences.channels, push: false } 
        };
        setPrefData('notification_preferences', updatedPrefs);

        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                if (subscription) {
                    const endpoint = subscription.endpoint;
                    await subscription.unsubscribe();
                    await axios.post(route(`${routePrefix}.pengaturan.push.unsubscribe`), { endpoint });
                    console.log('Berhasil menonaktifkan Web Push!');
                }
            } catch (error) {
                console.error('Gagal unsubscribe:', error);
            }
        }

        // BARU: langsung persist ke database, terlepas dari hasil unsubscribe di atas
        router.put(route(`${routePrefix}.pengaturan.preferensi.update`), {
            notification_preferences: updatedPrefs
        }, { preserveScroll: true });
    }
};

    // 5. DEAKTIVASI AKUN
    const handleDeactivate = () => {
        setModalConfig({
            isOpen: true,
            title: 'Nonaktifkan Akun',
            message: 'Apakah Anda yakin ingin menonaktifkan akun Anda? Anda tidak akan lagi menerima pemberitahuan digital dari RT 05.',
            type: 'danger',
            confirmText: 'Ya, Nonaktifkan',
            cancelText: 'Batal',
            onConfirm: () => {
                closeModal();
                router.delete(route(`${routePrefix}.pengaturan.nonaktifkan`));
            }
        });
    };

    return (
        <Sidebar currentRole={user.role} activeMenu="settings">
            <Head title="Pengaturan Akun" />

            <div className="max-w-4xl p-6 mx-auto mb-20 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pengaturan Akun</h1>
                    <p className="text-sm text-slate-500">Perbarui informasi pribadi dan preferensi keamanan Anda agar tetap terhubung dengan lingkungan.</p>
                </div>

                {/* --- SECTION 1: PROFIL & FOTO --- */}
                <div className="flex flex-col items-start justify-between p-6 space-y-4 bg-white border border-slate-200 rounded-xl md:flex-row md:items-center md:space-y-0 shadow-xs">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            {user.photo ? (
                                <img src={user.photo_url || user.photo} alt="Profil" className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-sm bg-slate-100" />
                            ) : (
                                <div className="flex items-center justify-center w-24 h-24 border-4 border-white rounded-full shadow-sm bg-slate-100 text-slate-400">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                            )}
                            <button onClick={() => photoInput.current.click()} className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 text-white transition-colors border-2 border-white rounded-full bg-emerald-700 hover:bg-emerald-800 cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <input type="file" ref={photoInput} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                            <p className="text-sm text-slate-500">ID Warga: {resident_id || 'N/A'}</p>
                            <div className="flex items-center mt-2 space-x-2">
                                <span className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full">RT 05</span>
                                <span className="px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">{currentRoleLabel}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => photoInput.current.click()} className="px-4 py-2 text-sm font-semibold transition-colors bg-white border rounded-lg border-emerald-700 text-emerald-700 hover:bg-emerald-50">
                        Ubah Foto
                    </button>
                </div>

                {/* --- SECTION 2: INFORMASI PROFIL DASAR --- */}
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <h3 className="flex items-center mb-4 text-lg font-bold text-emerald-800">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        Informasi Pribadi
                    </h3>
                    <form onSubmit={submitProfile} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    maxLength="255"
                                    autoComplete="name"
                                    value={profileData.name}
                                    onChange={e => setProfileData('name', e.target.value)}
                                    className="w-full text-sm font-normal text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs"
                                />
                                {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Alamat Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={profileData.email}
                                    onChange={e => setProfileData('email', e.target.value)}
                                    className="w-full text-sm font-normal text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs"
                                />
                                {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Nomor HP</label>
                                <input
                                    type="tel"
                                    pattern="[0-9]{10,15}"
                                    title="Masukkan nomor HP valid (10-15 digit angka)"
                                    autoComplete="tel"
                                    value={profileData.no_hp}
                                    onChange={e => setProfileData('no_hp', e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-sm font-normal text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs"
                                />
                                {profileErrors.no_hp && <p className="mt-1 text-xs text-red-500">{profileErrors.no_hp}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Pekerjaan</label>
                                <input
                                    type="text"
                                    maxLength="100"
                                    autoComplete="organization-title"
                                    value={profileData.occupation}
                                    onChange={e => setProfileData('occupation', e.target.value)}
                                    className="w-full text-sm font-normal text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs"
                                />
                                {profileErrors.occupation && <p className="mt-1 text-xs text-red-500">{profileErrors.occupation}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={profileProcessing} className="px-5 py-2.5 text-xs font-bold text-white transition-colors rounded-xl bg-[#0D7A57] hover:bg-[#0a5e43] disabled:opacity-50 shadow-sm cursor-pointer">
                                {profileProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- SECTION 3: KEAMANAN AKUN --- */}
                <div>
                    <h3 className="flex items-center mb-4 text-lg font-bold text-emerald-800">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        Keamanan Akun
                    </h3>
                    <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
                        <div className="p-6">
                            <p className="mb-4 text-xs font-semibold tracking-wider uppercase text-slate-500">
                                {has_password ? 'Ubah Kata Sandi' : 'Buat Kata Sandi'}
                            </p>

                            {!has_password && (
                                <div className="p-3 mb-4 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg">
                                    Akun Anda terdaftar melalui Google dan belum memiliki kata sandi. Buat kata sandi agar Anda juga bisa login menggunakan email &amp; kata sandi.
                                </div>
                            )}

                            <form onSubmit={submitPassword} className="space-y-4">
                                {/* Hidden username field untuk accessibility & password manager */}
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    autoComplete="username"
                                    readOnly
                                    hidden
                                />

                                {has_password && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Kata Sandi Saat Ini <span className="text-red-500">*</span></label>
                                        <div className="relative max-w-md">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                required
                                                autoComplete="current-password"
                                                value={passData.current_password}
                                                onChange={e => setPassData('current_password', e.target.value)}
                                                className="w-full text-sm font-normal text-gray-800 border border-gray-200 rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {passErrors.current_password && <p className="mt-1 text-xs text-red-500">{passErrors.current_password}</p>}
                                    </div>
                                )}
                                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                                    <div className="flex-1 max-w-xs">
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Kata Sandi Baru <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showNewPasswords ? "text" : "password"}
                                                required
                                                minLength="8"
                                                autoComplete="new-password"
                                                value={passData.password}
                                                onChange={e => setPassData('password', e.target.value)}
                                                className="w-full text-sm font-normal text-gray-800 border border-gray-200 rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {passErrors.password && <p className="mt-1 text-xs text-red-500">{passErrors.password}</p>}
                                    </div>
                                    <div className="flex-1 max-w-xs">
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showNewPasswords ? "text" : "password"}
                                                required
                                                minLength="8"
                                                autoComplete="new-password"
                                                value={passData.password_confirmation}
                                                onChange={e => setPassData('password_confirmation', e.target.value)}
                                                className={`w-full text-sm font-normal text-gray-800 border rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs ${customErrors.password_confirmation ? 'border-red-500' : 'border-gray-200'}`}
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowNewPasswords(!showNewPasswords)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                                                {showNewPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {(customErrors.password_confirmation || passErrors.password_confirmation) && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {customErrors.password_confirmation || passErrors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button type="submit" disabled={passProcessing} className="px-5 py-2.5 mt-2 text-xs font-bold text-white transition-colors rounded-xl bg-[#0D7A57] hover:bg-[#0a5e43] disabled:opacity-50 shadow-sm cursor-pointer">
                                    {has_password ? 'Perbarui Kata Sandi' : 'Buat Kata Sandi'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <form onSubmit={submitPreferences} className="space-y-8">
                    {/* --- SECTION 4: PREFERENSI NOTIFIKASI --- */}
                    <div>
                        <h3 className="flex items-center mb-4 text-lg font-bold text-emerald-800">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            Preferensi Notifikasi
                        </h3>
                        <div className="bg-white border border-slate-200 rounded-xl shadow-xs">
                            <div className="p-6 border-b border-slate-200">
                                <p className="mb-4 text-xs font-semibold tracking-wider uppercase text-slate-500">Jenis Notifikasi</p>
                                <div className="space-y-4">
                                    <label className="flex items-start cursor-pointer">
                                        <input type="checkbox" className="mt-1 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                            checked={prefData.notification_preferences.types.news_announcements}
                                            onChange={e => setPrefData('notification_preferences', { ...prefData.notification_preferences, types: { ...prefData.notification_preferences.types, news_announcements: e.target.checked } })}
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-slate-900">Berita & Pengumuman</span>
                                            <span className="block text-sm text-slate-500">Tetap terinformasi dengan acara lingkungan dan pesan resmi RT.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start cursor-pointer">
                                        <input type="checkbox" className="mt-1 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                            checked={prefData.notification_preferences.types.financial_reminders}
                                            onChange={e => setPrefData('notification_preferences', { ...prefData.notification_preferences, types: { ...prefData.notification_preferences.types, financial_reminders: e.target.checked } })}
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-slate-900">Pengingat Iuran & Keuangan</span>
                                            <span className="block text-sm text-slate-500">Pengingat untuk iuran warga, biaya kebersihan, dan pembayaran lainnya.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start cursor-pointer">
                                        <input type="checkbox" className="mt-1 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                            checked={prefData.notification_preferences.types.report_updates}
                                            onChange={e => setPrefData('notification_preferences', { ...prefData.notification_preferences, types: { ...prefData.notification_preferences.types, report_updates: e.target.checked } })}
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-slate-900">Pembaruan Laporan</span>
                                            <span className="block text-sm text-slate-500">Terima pemberitahuan saat laporan atau pengaduan Anda diselesaikan.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="mb-4 text-xs font-semibold tracking-wider uppercase text-slate-500">Metode Pengiriman</p>
                                <div className="flex space-x-6">
                                    <label className="flex items-center cursor-pointer">
                                        {/* DITAMBAHKAN: onChange sekarang memanggil handlePushToggle */}
                                        <input type="checkbox" className="mr-2 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                            checked={prefData.notification_preferences.channels.push}
                                            onChange={handlePushToggle}
                                        />
                                        <span className="text-sm font-medium text-slate-900">Notifikasi Push (Web)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={prefProcessing} className="px-6 py-2.5 text-xs font-bold text-white transition-colors rounded-xl bg-[#0D7A57] hover:bg-[#0a5e43] disabled:opacity-50 shadow-sm cursor-pointer">
                            {prefProcessing ? 'Menyimpan Preferensi...' : 'Simpan Preferensi'}
                        </button>
                    </div>
                </form>

                {/* --- SECTION 5: DANGER ZONE --- */}
                <div>
                    <h3 className="flex items-center mb-4 text-lg font-bold text-red-700">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Zona Berbahaya
                    </h3>
                    <div className="flex flex-col justify-between p-6 border border-red-200 border-dashed bg-red-50 rounded-xl md:flex-row md:items-center shadow-xs">
                        <div className="max-w-xl mb-4 md:mb-0">
                            <h4 className="mb-1 text-sm font-bold tracking-wider text-red-700 uppercase">Nonaktifkan Akun</h4>
                            <p className="text-sm text-red-700/80">Setelah Anda menonaktifkan akun, Anda tidak akan lagi menerima pemberitahuan digital dari RT 05. Tindakan ini dapat dibatalkan dengan menghubungi administrator RT.</p>
                        </div>
                        <button
                            type="button" // Ditambahkan agar tidak submit form preferensi
                            onClick={handleDeactivate}
                            className="whitespace-nowrap px-6 py-2.5 text-xs font-bold text-white transition-colors rounded-xl bg-[#B91C1C] hover:bg-red-800 shadow-sm cursor-pointer"
                        >
                            Nonaktifkan Akun
                        </button>
                    </div>
                </div>

            </div>

            {/* INTEGRASI MODAL CARD */}
            <ModalCard 
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                onConfirm={modalConfig.onConfirm}
            />
            <Footer />
        </Sidebar>
    );
}