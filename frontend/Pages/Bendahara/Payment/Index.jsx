import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Search, 
    Bell, 
    Clock,
    AlertTriangle,
    CheckCircle2,
    Landmark,
    MoreVertical,
    Calendar,
    ChevronRight,
    Plus,
    Mail,
    QrCode,
    Wallet,
    X,
    Eye,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Home,
    ArrowRight,
    Upload,
    CreditCard
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import ModalCard from '@/Components/ModalCard';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function Index({ user, dues = [], paymentMethods = [], paymentHistory = [], myPaymentHistory = [], stats = {}, filters = {} }) {
    const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

    if (user.role !== 'bendahara' && !user.house_id) {
        return (
            <Sidebar currentRole={user.role} activeMenu="finance">
                <Head title="Manajemen Keuangan" />
                <div className="py-12 bg-[#F8FAFC] min-h-screen font-sans flex items-center justify-center">
                    <div className="mx-auto max-w-md px-4 text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 text-[#0D7A57] rounded-3xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                            <Home className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                Data Rumah Belum Terdaftar
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                Oops! Anda belum memiliki data rumah atau belum terhubung ke unit rumah manapun di RT 05. Silakan daftarkan data rumah Anda terlebih dahulu untuk mengakses menu iuran dan keuangan.
                            </p>
                        </div>
                        <div>
                            <Link 
                                href={route(`${prefix}.house.index`)}
                                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#0D7A57] text-white rounded-2xl font-bold text-xs sm:text-sm hover:bg-[#0A6145] transition shadow-md cursor-pointer"
                            >
                                <span>Isi Data Rumah Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </Sidebar>
        );
    }

    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('daftar_tagihan');

    // Otomatis membaca parameter URL tab (Contoh: ?tab=antrean_verifikasi)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, []);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (flash?.status) {
            setShowFlash(true);
        }
    }, [flash]);

    const [selectedMonth, setSelectedMonth] = useState('semua');
    const [historySearch, setHistorySearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('Baru saja');

    // State Pembayaran Mandiri
    const [selectedDues, setSelectedDues] = useState([]);
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    // State Upload Ulang Bukti Pembayaran
    const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
    const [reuploadPaymentId, setReuploadPaymentId] = useState(null);
    const [newProofFile, setNewProofFile] = useState(null);
    const [isSubmittingReupload, setIsSubmittingReupload] = useState(false);

    // State Modals
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [methodForm, setMethodForm] = useState({
        type: 'bank',
        provider_name: '',
        account_number: '',
        account_holder: '',
        qris_image: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectProcessing, setRejectProcessing] = useState(false);

    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyingId, setVerifyingId] = useState(null);
    const [verifyProcessing, setVerifyProcessing] = useState(false);

    const [isRemindAllModalOpen, setIsRemindAllModalOpen] = useState(false);
    const [remindAllProcessing, setRemindAllProcessing] = useState(false);

    // Arrays & Data
    const rawDuesArray = Array.isArray(dues) ? dues : (dues.data || []);
    const duesArray = Array.from(
        new Map(rawDuesArray.map(item => [`${item.house_id}-${item.title}`, item])).values()
    );

    const paymentHistoryArray = Array.isArray(paymentHistory) ? paymentHistory : (paymentHistory.data || []);
    const myHistoryArray = Array.isArray(myPaymentHistory) ? myPaymentHistory : (myPaymentHistory.data || []);

    const isIncrease = stats?.is_increase ?? true;
    const percentage = stats?.percentage_change ?? 0;

    const activeIurans = duesArray.filter(i => i.status === 'belum_bayar' || i.status === 'ditolak');
    const totalBelumBayar = activeIurans.reduce((sum, item) => sum + Number(item.amount), 0);

    const verifiedPayments = paymentHistoryArray.filter(p => p.status === 'diverifikasi' || p.status === 'lunas');
    const totalTerkumpul = verifiedPayments.reduce((sum, item) => sum + Number(item.total_amount), 0);

    const pendingPaymentsList = paymentHistoryArray.filter(p => p.status === 'menunggu_verifikasi');
    const totalPending = pendingPaymentsList.reduce((sum, item) => sum + Number(item.total_amount), 0);

    const filteredDues = duesArray.filter(d => {
        const matchesMonth = selectedMonth === 'semua' || 
            (d.period_label && d.period_label.toLowerCase().includes(selectedMonth.toLowerCase())) ||
            (d.title && d.title.toLowerCase().includes(selectedMonth.toLowerCase()));
        return matchesMonth;
    });

    const filteredPendingPayments = pendingPaymentsList;

    // Filter pencarian khusus riwayat pembayaran pribadi bendahara/warga
    const filteredHistoryList = myHistoryArray.filter(p => {
        const matchesSearch = historySearch === '' || 
            (p.total_amount && p.total_amount.toString().includes(historySearch)) ||
            (p.dues_titles && p.dues_titles.some(title => title.toLowerCase().includes(historySearch.toLowerCase())));
        return matchesSearch;
    });

    const myUnpaidDues = duesArray.filter(d => (d.status === 'belum_bayar' || d.status === 'ditolak') && (d.is_my_due || d.user_id === user.id || d.house_id === user.house_id));

    // Handlers
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        router.get(route(route().current()), { search: value }, {
            preserveState: true,
            preserveScroll: true,
            only: ['dues', 'paymentHistory', 'filters'],
        });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['dues', 'paymentHistory', 'paymentMethods'],
            onFinish: () => {
                setIsRefreshing(false);
                const now = new Date();
                const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                setLastUpdated(`Hari ini, ${timeString}`);
            }
        });
    };

    const handleKirimMasal = () => {
        setIsRemindAllModalOpen(true);
    };

    const submitRemindAll = () => {
        setRemindAllProcessing(true);
        router.post(route(`${prefix}.dues.remind-all`), {}, {
            preserveScroll: true,
            onFinish: () => {
                setRemindAllProcessing(false);
                setIsRemindAllModalOpen(false);
            }
        });
    };

    const handleIngatkanWarga = (dueId) => {
        router.post(route(`${prefix}.dues.remind`, dueId), {}, {
            preserveScroll: true,
        });
    };

    const handleVerify = (paymentId) => {
        setVerifyingId(paymentId);
        setIsVerifyModalOpen(true);
    };

    const submitVerify = () => {
        if (!verifyingId) return;
        setVerifyProcessing(true);
        router.put(route('bendahara.dues.verify', verifyingId), {}, {
            preserveScroll: true,
            onFinish: () => {
                setVerifyProcessing(false);
                setIsVerifyModalOpen(false);
                setVerifyingId(null);
            }
        });
    };

    const handleReject = (paymentId) => {
        setRejectingId(paymentId);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const submitReject = (reason) => {
        if (!rejectingId) return;
        setRejectProcessing(true);
        router.put(route('bendahara.dues.reject', rejectingId), { rejection_reason: reason }, {
            preserveScroll: true,
            onFinish: () => {
                setRejectProcessing(false);
                setIsRejectModalOpen(false);
                setRejectingId(null);
                setRejectReason('');
            }
        });
    };

    const openReuploadModal = (paymentId) => {
        setReuploadPaymentId(paymentId);
        setNewProofFile(null);
        setIsReuploadModalOpen(true);
    };

    const handleReuploadSubmit = (e) => {
        e.preventDefault();
        if (!newProofFile) {
            alert('Silakan upload file bukti pembayaran baru.');
            return;
        }

        setIsSubmittingReupload(true);

        router.post(route(`${prefix}.dues.reupload-payment`, reuploadPaymentId), {
            _method: 'PUT',
            proof_photo: newProofFile,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsReuploadModalOpen(false);
                setNewProofFile(null);
                setReuploadPaymentId(null);
            },
            onError: (errors) => {
                const errorMsg = errors?.proof_photo || 'Terjadi kesalahan saat mengunggah ulang bukti pembayaran.';
                alert(errorMsg);
            },
            onFinish: () => {
                setIsSubmittingReupload(false);
            }
        });
    };

    const handleToggleMethod = (method) => {
        const nextStatus = method.is_active ? 0 : 1;
        router.put(route(`${prefix}.dues.payment-methods.update`, method.id), {
            type: method.type,
            provider_name: method.provider_name || '',
            account_number: method.account_number || '',
            account_holder: method.account_holder || '',
            is_active: nextStatus,
        }, {
            preserveScroll: true,
        });
    };

    const openCreateModal = () => {
        setEditingMethod(null);
        setMethodForm({ type: 'bank', provider_name: '', account_number: '', account_holder: '', qris_image: null });
        setIsMethodModalOpen(true);
    };

    const openEditModal = (method) => {
        setEditingMethod(method);
        setMethodForm({
            type: method.type || 'bank',
            provider_name: method.provider_name || '',
            account_number: method.account_number || '',
            account_holder: method.account_holder || '',
            qris_image: null
        });
        setIsMethodModalOpen(true);
    };

    const handleMethodSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('type', methodForm.type);
        formData.append('provider_name', methodForm.provider_name || '');
        formData.append('account_number', methodForm.account_number || '');
        formData.append('account_holder', methodForm.account_holder || '');

        if (editingMethod) {
            formData.append('is_active', editingMethod.is_active ? 1 : 0);
        } else {
            formData.append('is_active', 1);
        }

        if (methodForm.qris_image) {
            formData.append('qris_image', methodForm.qris_image);
        }

        if (editingMethod) {
            formData.append('_method', 'PUT');
            router.post(route(`${prefix}.dues.payment-methods.update`, editingMethod.id), formData, {
                onSuccess: () => setIsMethodModalOpen(false),
                preserveScroll: true
            });
        } else {
            router.post(route(`${prefix}.dues.payment-methods.store`), formData, {
                onSuccess: () => setIsMethodModalOpen(false),
                preserveScroll: true
            });
        }
    };

    const handleCheckboxChange = (id) => {
        if (selectedDues.includes(id)) {
            setSelectedDues(selectedDues.filter(item => item !== id));
        } else {
            setSelectedDues([...selectedDues, id]);
        }
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        if (selectedDues.length === 0) {
            alert('Silakan pilih minimal satu tagihan yang ingin dibayar.');
            return;
        }
        if (!selectedMethodId) {
            alert('Silakan pilih metode pembayaran.');
            return;
        }
        if (!proofFile) {
            alert('Silakan upload bukti pembayaran terlebih dahulu.');
            return;
        }

        setIsSubmittingPayment(true);
        const formData = new FormData();
        selectedDues.forEach(id => formData.append('due_ids[]', id));
        formData.append('payment_method_id', selectedMethodId);
        formData.append('proof_photo', proofFile);

        router.post(route(`${prefix}.dues.submit-payment`), formData, {
            onSuccess: () => {
                setSelectedDues([]);
                setSelectedMethodId('');
                setProofFile(null);
                setIsSubmittingPayment(false);
                setActiveTab('antrean_verifikasi');
            },
            onError: () => {
                setIsSubmittingPayment(false);
            }
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeProofUrl, setActiveProofUrl] = useState(null);

    return (
        <Sidebar currentRole={user.role} activeMenu="finance">
            <Head title="Manajemen Keuangan" />

            <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {flash?.status && showFlash && (
                        <div className="p-4 bg-emerald-50 text-emerald-800 font-medium rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="text-xs sm:text-sm">{flash.status}</span>
                            </div>
                            <button 
                                onClick={() => setShowFlash(false)} 
                                className="p-1 text-emerald-700 hover:bg-emerald-100/80 rounded-lg transition cursor-pointer"
                                title="Tutup Notifikasi"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Manajemen Keuangan</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Kelola tagihan, verifikasi pembayaran, bayar iuran warga, dan atur metode pembayaran.</p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari data warga..." 
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full bg-white border border-gray-200 rounded-xl text-xs pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none shadow-xs"
                                />
                            </div>

                            <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                                <NotifikasiBell prefix={prefix} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <Landmark className="w-6 h-6 text-[#0D7A57]" />
                                </div>
                                <span className={`px-3 py-1 text-[11px] font-bold rounded-full flex items-center gap-1 border ${
                                    isIncrease 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                    {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                    {isIncrease ? `+${percentage}%` : `-${percentage}%`}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Iuran Terkumpul</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#0D7A57] mb-3 tracking-tight">{formatRupiah(totalTerkumpul)}</h2>

                            <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                <button 
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-lg transition cursor-pointer disabled:opacity-50"
                                    title="Refresh Data"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Update terakhir: {lastUpdated}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                                    {pendingPaymentsList.length} Antrian
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Menunggu Verifikasi</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-amber-600 mb-3 tracking-tight">{formatRupiah(totalPending)}</h2>
                            <p className="text-[11px] text-amber-600 flex items-center gap-1.5 font-medium pt-3 border-t border-gray-50">
                                ⚡ Perlu tindakan segera
                            </p>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                </div>
                                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full border border-rose-100">
                                    {activeIurans.length} Warga
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Belum Terbayar</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-rose-600 mb-3 tracking-tight">{formatRupiah(totalBelumBayar)}</h2>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 font-medium pt-3 border-t border-gray-50">
                                Belum kirim pengingat
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto scrollbar-none">
                        <button 
                            onClick={() => setActiveTab('daftar_tagihan')}
                            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'daftar_tagihan' ? 'border-[#0D7A57] text-[#0D7A57]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Daftar Tagihan
                        </button>
                        <button 
                            onClick={() => setActiveTab('bayar_iuran')}
                            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'bayar_iuran' ? 'border-[#0D7A57] text-[#0D7A57]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Bayar Iuran Saya
                        </button>
                        <button 
                            onClick={() => setActiveTab('antrean_verifikasi')}
                            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'antrean_verifikasi' ? 'border-[#0D7A57] text-[#0D7A57]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Antrian & Riwayat Pembayaran
                        </button>
                        <button 
                            onClick={() => setActiveTab('metode_pembayaran')}
                            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'metode_pembayaran' ? 'border-[#0D7A57] text-[#0D7A57]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Metode Pembayaran
                        </button>
                    </div>

                    {activeTab === 'daftar_tagihan' && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Kelola Tagihan Iuran</h2>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <select 
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-700 cursor-pointer outline-none p-0"
                                        >
                                            <option value="semua">Semua Bulan</option>
                                            <option value="Januari">Januari</option>
                                            <option value="Februari">Februari</option>
                                            <option value="Maret">Maret</option>
                                            <option value="April">April</option>
                                            <option value="Mei">Mei</option>
                                            <option value="Juni">Juni</option>
                                            <option value="Juli">Juli</option>
                                            <option value="Agustus">Agustus</option>
                                            <option value="September">September</option>
                                            <option value="Oktober">Oktober</option>
                                            <option value="November">November</option>
                                            <option value="Desember">Desember</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                                    <button 
                                        onClick={handleKirimMasal}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-[#0D7A57] rounded-xl text-xs font-bold hover:bg-emerald-100 transition shadow-xs cursor-pointer border border-emerald-100"
                                    >
                                        <Mail className="w-4 h-4" /> <span>Kirim Notifikasi Masal</span>
                                    </button>
                                    <Link 
                                        href={route(`${prefix}.dues.manage`)}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0A6145] text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Kelola Tagihan</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                    <thead>
                                        <tr className="text-[10px] text-gray-400 uppercase tracking-wider bg-[#F4F6FC]">
                                            <th className="px-4 py-3 w-12 text-center">No</th>
                                            <th className="px-4 py-3">Nama Warga</th>
                                            <th className="px-4 py-3">No. Rumah</th>
                                            <th className="px-4 py-3">Bulan</th>
                                            <th className="px-4 py-3">Jumlah</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredDues.length > 0 ? (
                                            filteredDues.map((due, index) => {
                                                const page = dues.current_page || 1;
                                                const perPage = dues.per_page || 10;
                                                const noUrut = (page - 1) * perPage + index + 1;

                                                const residentName = due.resident_name || 'Warga';
                                                const blockNumber = due.block_number || 'Blok -';
                                                const initials = residentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                                                return (
                                                    <tr key={due.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-4 py-3.5 text-center font-bold text-gray-500 whitespace-nowrap">
                                                            {noUrut}
                                                        </td>
                                                        <td className="px-4 py-3.5 flex items-center gap-3 whitespace-nowrap">
                                                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0D7A57] font-bold flex items-center justify-center text-xs shadow-xs border border-emerald-100 shrink-0">
                                                                {initials}
                                                            </div>
                                                            <span className="font-bold text-gray-900">{residentName}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                                                            {blockNumber}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-gray-600 font-medium whitespace-nowrap">
                                                            {due.period_label || 'Bulanan'}
                                                        </td>
                                                        <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                                                            {formatRupiah(due.amount)}
                                                        </td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                                            {due.status === 'lunas' || due.status === 'diverifikasi' ? (
                                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Terbayar
                                                                </span>
                                                            ) : due.status === 'menunggu_verifikasi' ? (
                                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> Pending
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3" /> Belum Bayar
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                            {due.status === 'belum_bayar' || due.status === 'ditolak' ? (
                                                                <button 
                                                                    onClick={() => handleIngatkanWarga(due.id)}
                                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer border border-rose-100"
                                                                >
                                                                    Ingatkan
                                                                </button>
                                                            ) : (
                                                                <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition inline-flex items-center justify-center cursor-pointer">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-8 text-center text-xs text-gray-400 italic">
                                                    Tidak ada data tagihan ditemukan untuk filter ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {dues?.links && dues.links.length > 3 && (
                                <div className="py-4 px-4 bg-[#F4F6FC] border-t border-gray-100 flex justify-center rounded-2xl">
                                    <Pagination links={dues.links} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'bayar_iuran' && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Form Pembayaran Iuran</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Pilih tagihan iuran Anda yang belum dibayar dan unggah bukti transfer.</p>
                            </div>

                            {myUnpaidDues.length > 0 ? (
                                <form onSubmit={handlePaySubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Pilih Tagihan yang Ingin Dibayar</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {myUnpaidDues.map((due) => (
                                                <div 
                                                    key={due.id} 
                                                    onClick={() => handleCheckboxChange(due.id)}
                                                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                                                        selectedDues.includes(due.id) 
                                                            ? 'border-[#0D7A57] bg-emerald-50/40 shadow-xs' 
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedDues.includes(due.id)}
                                                            onChange={() => {}}
                                                            className="w-4 h-4 text-[#0D7A57] rounded border-gray-300 focus:ring-[#0D7A57] cursor-pointer"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-xs sm:text-sm">{due.title || due.period_label}</p>
                                                            <p className="text-[11px] text-gray-500">{due.period_label || 'Bulanan'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-[#0D7A57] text-xs sm:text-sm">{formatRupiah(due.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Pilih Metode Pembayaran Tujuan</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {paymentMethods.filter(m => m.is_active).map((method) => (
                                                <div 
                                                    key={method.id}
                                                    onClick={() => setSelectedMethodId(method.id)}
                                                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                                                        selectedMethodId === method.id 
                                                            ? 'border-[#0D7A57] bg-emerald-50/40 shadow-xs' 
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-xs text-gray-900 uppercase">{method.provider_name || method.type_label}</span>
                                                        <input 
                                                            type="radio" 
                                                            checked={selectedMethodId === method.id}
                                                            onChange={() => setSelectedMethodId(method.id)}
                                                            className="text-[#0D7A57] focus:ring-[#0D7A57] cursor-pointer"
                                                        />
                                                    </div>
                                                    <p className="text-xs font-mono font-bold text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                        {method.account_number || 'QRIS / E-Wallet'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1">A.n {method.account_holder || 'RT 05'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Upload Bukti Pembayaran / Transfer</label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer">
                                                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                                <span className="text-xs font-bold text-gray-700">{proofFile ? proofFile.name : 'Klik untuk pilih file bukti transfer'}</span>
                                                <span className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG, PDF (Maks. 2MB)</span>
                                                <input 
                                                    type="file" 
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => setProofFile(e.target.files[0])}
                                                    className="hidden" 
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button 
                                            type="submit"
                                            disabled={isSubmittingPayment}
                                            className="px-6 py-3 bg-[#0D7A57] hover:bg-[#0A6145] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            <span>{isSubmittingPayment ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}</span>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="py-12 text-center space-y-3">
                                    <div className="w-16 h-16 bg-emerald-50 text-[#0D7A57] rounded-full mx-auto flex items-center justify-center border border-emerald-100">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">Semua Tagihan Anda Lunas!</h3>
                                    <p className="text-xs text-gray-500 max-w-sm mx-auto">Tidak ada tagihan iuran aktif atau tertunda atas nama akun Anda saat ini.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'antrean_verifikasi' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Antrian Verifikasi Pembayaran</h2>
                                    <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-100">
                                        {filteredPendingPayments.length} Menunggu Verifikasi
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 uppercase tracking-wider bg-[#F4F6FC]">
                                                <th className="px-4 py-3 w-12 text-center">No</th>
                                                <th className="px-4 py-3">Tanggal</th>
                                                <th className="px-4 py-3">Nama Warga</th>
                                                <th className="px-4 py-3">Metode</th>
                                                <th className="px-4 py-3">Jumlah</th>
                                                <th className="px-4 py-3">Bukti</th>
                                                <th className="px-4 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredPendingPayments.length > 0 ? (
                                                filteredPendingPayments.map((history, index) => {
                                                    const residentName = history.resident_name || 'Warga';
                                                    const initials = residentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                                                    return (
                                                        <tr key={history.id} className="hover:bg-gray-50/50 transition">
                                                            <td className="px-4 py-3.5 text-center font-bold text-gray-500 whitespace-nowrap">{index + 1}</td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                                                                <p className="font-bold text-gray-900">{history.created_at?.split(' ')[0]}</p>
                                                                <p className="text-[10px] text-gray-400">{history.created_at?.split(' ')[1]}</p>
                                                            </td>
                                                            <td className="px-4 py-3.5 flex items-center gap-3 whitespace-nowrap">
                                                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0D7A57] font-bold flex items-center justify-center text-xs shadow-xs border border-emerald-100 shrink-0">
                                                                    {initials}
                                                                </div>
                                                                <span className="font-bold text-gray-900">{residentName}</span>
                                                            </td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-lg border border-gray-200">
                                                                    {history.payment_method_label || 'Belum tercatat'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">{formatRupiah(history.total_amount)}</td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                                {history.proof_photo ? (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setActiveProofUrl(history.proof_photo);
                                                                            setIsModalOpen(true);
                                                                        }}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border border-emerald-100"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" /> <span>Lihat</span>
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs italic">Tidak ada</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                                    <button 
                                                                        onClick={() => handleReject(history.id)}
                                                                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition cursor-pointer border border-rose-100 shadow-xs"
                                                                    >
                                                                        Ditolak
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleVerify(history.id)}
                                                                        className="px-3 py-1.5 bg-[#0D7A57] hover:bg-[#0A6145] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                                                                    >
                                                                        Verifikasi
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-4 py-8 text-center text-xs text-gray-400 italic">
                                                        Tidak ada antrian verifikasi pembayaran saat ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* RIWAYAT PEMBAYARAN PRIBADI BENDAHARA */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Riwayat Pembayaran Saya</h2>

                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Cari transaksi..." 
                                            value={historySearch}
                                            onChange={(e) => setHistorySearch(e.target.value)}
                                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl text-xs pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-[#0D7A57] outline-none shadow-xs"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 uppercase tracking-wider bg-[#F4F6FC]">
                                                <th className="px-4 py-3">Tanggal</th>
                                                <th className="px-4 py-3">Keterangan</th>
                                                <th className="px-4 py-3">Jumlah</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredHistoryList.length > 0 ? (
                                                filteredHistoryList.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                                                            <span className="font-bold text-gray-900">{item.created_at?.split(' ')[0]}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5 font-bold text-gray-900">
                                                            {item.dues_titles?.join(', ') || 'Iuran Warga'}
                                                        </td>
                                                        <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                                                            {formatRupiah(item.total_amount)}
                                                        </td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                                            {item.status === 'diverifikasi' || item.status === 'lunas' ? (
                                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Lunas / Selesai
                                                                </span>
                                                            ) : item.status === 'ditolak' ? (
                                                                <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3" /> Ditolak
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {item.proof_photo && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setActiveProofUrl(item.proof_photo);
                                                                            setIsModalOpen(true);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] text-xs font-bold rounded-xl transition inline-flex items-center gap-1 shadow-xs border border-emerald-100 cursor-pointer"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" /> <span>Lihat</span>
                                                                    </button>
                                                                )}
                                                                
                                                                {item.status === 'ditolak' && (
                                                                    <button 
                                                                        onClick={() => openReuploadModal(item.id)}
                                                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition inline-flex items-center gap-1 shadow-xs border border-blue-100 cursor-pointer"
                                                                    >
                                                                        <Upload className="w-3.5 h-3.5" /> <span>Upload Ulang</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-xs text-gray-400 italic">
                                                        Belum ada riwayat transaksi pembayaran pribadi Anda.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'metode_pembayaran' && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Kelola Metode Pembayaran</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {paymentMethods.length > 0 ? (
                                    paymentMethods.map((method) => {
                                        const isActive = Boolean(method.is_active);

                                        return (
                                            <div key={method.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between relative transition hover:shadow-sm">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#0D7A57] shadow-xs">
                                                            {method.type === 'qris' ? (
                                                                <QrCode className="w-6 h-6 text-[#0D7A57]" />
                                                            ) : method.type === 'ewallet' ? (
                                                                <Wallet className="w-6 h-6 text-purple-600" />
                                                            ) : (
                                                                <span className="font-extrabold text-xs text-blue-700">{method.provider_name ? method.provider_name.substring(0, 3).toUpperCase() : 'BNK'}</span>
                                                            )}
                                                        </div>

                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isActive} 
                                                                onChange={() => handleToggleMethod(method)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D7A57]"></div>
                                                        </label>
                                                    </div>

                                                    <h3 className="font-bold text-gray-900 text-sm">{method.provider_name || method.type_label}</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">{method.account_holder || 'Siwarga05 Finance'}</p>

                                                    {method.type === 'qris' && method.qris_image ? (
                                                        <div className="mt-3">
                                                            <button onClick={() => setPreviewImage(method.qris_image)} className="inline-block relative group cursor-pointer text-left">
                                                                <img 
                                                                    src={method.qris_image} 
                                                                    alt="QRIS" 
                                                                    className="w-16 h-16 rounded-xl border border-gray-200 object-cover shadow-xs group-hover:opacity-60 transition-opacity" 
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                                    <span className="text-white text-[10px] font-bold">Lihat</span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs font-mono font-bold text-gray-800 mt-3 tracking-wider bg-gray-50 p-2.5 rounded-xl border border-gray-100 w-fit">
                                                            {method.account_number || '-'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 text-xs">
                                                    <span className={`font-bold ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                                                        Status: {isActive ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                    <button 
                                                        onClick={() => openEditModal(method)} 
                                                        className="font-bold text-[#0D7A57] hover:underline flex items-center gap-1 transition cursor-pointer"
                                                    >
                                                        Edit ✎
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : null}

                                <button 
                                    onClick={openCreateModal}
                                    className="rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/30 hover:bg-emerald-50/60 p-6 flex flex-col items-center justify-center text-center transition group min-h-[220px] cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#0D7A57] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition mb-3">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-[#0D7A57] text-xs sm:text-sm">Tambah Metode Baru</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL UPLOAD ULANG BUKTI PEMBAYARAN */}
            {isReuploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4 relative">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-base font-bold text-gray-900">Upload Ulang Bukti</h3>
                            <button onClick={() => setIsReuploadModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleReuploadSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Pilih File Baru</label>
                                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs font-bold text-gray-700 text-center">
                                        {newProofFile ? newProofFile.name : 'Klik untuk pilih file'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG, PDF (Maks. 2MB)</span>
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={(e) => setNewProofFile(e.target.files[0])}
                                        className="hidden" 
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsReuploadModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmittingReupload}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmittingReupload ? 'Mengirim...' : 'Upload Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FORM METODE PEMBAYARAN */}
            {isMethodModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                            {editingMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}
                        </h3>

                        <form onSubmit={handleMethodSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipe Metode</label>
                                <select 
                                    value={methodForm.type}
                                    onChange={(e) => setMethodForm({...methodForm, type: e.target.value})}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                >
                                    <option value="bank">Transfer Bank</option>
                                    <option value="ewallet">E-Wallet (DANA, GoPay, OVO)</option>
                                    <option value="qris">QRIS</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nama Provider / Bank</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: BCA / DANA / QRIS Utama"
                                    value={methodForm.provider_name}
                                    onChange={(e) => setMethodForm({...methodForm, provider_name: e.target.value})}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                />
                            </div>

                            {methodForm.type === 'qris' ? (
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Upload Foto QRIS</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setMethodForm({...methodForm, qris_image: e.target.files[0]})}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG, atau JPEG (Maks. 2MB)</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nomor Rekening / No. HP E-Wallet</label>
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: 8830123456 atau 08123456789"
                                        value={methodForm.account_number}
                                        onChange={(e) => setMethodForm({...methodForm, account_number: e.target.value})}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Atas Nama Pemilik</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: Kas RT 05 / Andi Santoso"
                                    value={methodForm.account_holder}
                                    onChange={(e) => setMethodForm({...methodForm, account_holder: e.target.value})}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsMethodModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D7A57] text-white hover:bg-[#0A6145] transition shadow-sm cursor-pointer"
                                >
                                    {editingMethod ? 'Simpan Perubahan' : 'Tambah Metode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewImage(null)}>
                    <div className="bg-white rounded-3xl max-w-sm w-full p-4 relative shadow-2xl space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Preview QRIS</h4>
                            <button onClick={() => setPreviewImage(null)} className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold hover:bg-gray-200 transition cursor-pointer text-xs">✕</button>
                        </div>
                        <img src={previewImage} alt="QRIS Besar" className="w-full h-auto rounded-xl border border-gray-100 shadow-sm object-contain max-h-[70vh]" />
                    </div>
                </div>
            )}

            <ModalCard 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Bukti Transfer Pembayaran"
                imageUrl={activeProofUrl}
                onConfirm={() => setIsModalOpen(false)}
                confirmText="Tutup"
                cancelText="" 
            />

            <ModalCard
                isOpen={isVerifyModalOpen}
                onClose={() => {
                    if (verifyProcessing) return;
                    setIsVerifyModalOpen(false);
                    setVerifyingId(null);
                }}
                title="Verifikasi Pembayaran"
                message="Apakah Anda yakin ingin memverifikasi/menerima pembayaran ini?"
                confirmText="Ya, Verifikasi"
                cancelText="Batal"
                processing={verifyProcessing}
                onConfirm={submitVerify}
            />

            <ModalCard
                isOpen={isRejectModalOpen}
                onClose={() => {
                    if (rejectProcessing) return;
                    setIsRejectModalOpen(false);
                    setRejectingId(null);
                    setRejectReason('');
                }}
                type="prompt"
                title="Tolak Pembayaran"
                message="Masukkan alasan penolakan pembayaran:"
                confirmText="OK"
                cancelText="Batal"
                inputValue={rejectReason}
                onInputChange={setRejectReason}
                inputPlaceholder="Contoh: Bukti transfer tidak sesuai nominal"
                processing={rejectProcessing}
                onConfirm={submitReject}
            />

            <ModalCard
                isOpen={isRemindAllModalOpen}
                onClose={() => {
                    if (remindAllProcessing) return;
                    setIsRemindAllModalOpen(false);
                }}
                title="Kirim Pengingat Masal"
                message="Apakah Anda yakin ingin mengirim pengingat tagihan secara massal ke semua warga yang belum membayar?"
                confirmText="Ya, Kirim"
                cancelText="Batal"
                processing={remindAllProcessing}
                onConfirm={submitRemindAll}
            />
            <Footer />
        </Sidebar>
    );
}