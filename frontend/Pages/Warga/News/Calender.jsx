import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Tag, ChevronLeft, ChevronRight, Share2, ArrowLeft } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar'; 
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function CalendarIndex({ auth, paginatedEvents }) {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Filter kategori aktif
    const [activeFilters, setActiveFilters] = useState({
        Announcement: true,
        Event: true,
        Keamanan: true,
        Informasi: true,
        Keuangan: true,
    });

    // Kontrol navigasi bulan kalender interaktif
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data, setData, post, processing, reset } = useForm({
        title: '',
        date: '',
        time: '',
        location: '',
        category: 'Informasi',
        description: '',
    });

    // Ambil data gabungan dari backend
    useEffect(() => {
        fetch('/warga/kalender/data')
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat data');
                return res.json();
            })
            .then((data) => {
                setEvents(data);
                if (data.length > 0) setSelectedEvent(data[0]);
            })
            .catch((err) => console.error('Gagal memuat data kalender:', err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/warga/kalender', {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                window.location.reload();
            },
        });
    };

    // Fungsi Bagikan Acara
    const handleShare = async () => {
        if (!selectedEvent) return;
        
        const waktu = selectedEvent.time ? `${selectedEvent.time} WIB` : '08:00 WIB';
        const teksShare = `Catat jadwalnya! ${selectedEvent.title} pada ${selectedEvent.date} jam ${waktu}. Lokasi: ${selectedEvent.location || 'Balai Warga RT 05'}.`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: selectedEvent.title,
                    text: teksShare,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Batal membagikan', err);
            }
        } else {
            // Fallback jika device tidak support Share API
            navigator.clipboard.writeText(`${teksShare}\n\nCek di: ${window.location.href}`);
            alert('Info acara berhasil disalin ke clipboard!');
        }
    };

    const toggleFilter = (category) => {
        setActiveFilters(prev => ({ ...prev, [category]: !prev[category] }));
    };

    // Navigasi bulan
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    // Filter event berdasarkan kategori aktif
    const filteredEvents = events.filter(ev => activeFilters[ev.category] !== false);

    // Generate tanggal untuk grid kalender bulan ini (DISEMPURNAKAN AGAR TIDAK ADA TANGGAL LUBER)
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    
    // Kotak kosong awal bulan
    for (let i = 0; i < firstDayIndex; i++) {
        calendarDays.push({ dayNumber: '', dateStr: null, items: [] });
    }
    
    // Tanggal aktif bulan ini
    for (let d = 1; d <= totalDays; d++) {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = filteredEvents.filter(ev => ev.date === formattedDate);
        calendarDays.push({ dayNumber: d, dateStr: formattedDate, items: dayEvents });
    }

    // Sisa kotak kosong akhir bulan agar baris grid selalu genap 7 kolom
    const remainingCells = (7 - (calendarDays.length % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
        calendarDays.push({ dayNumber: '', dateStr: null, items: [] });
    }

    return (
        <Sidebar currentRole="warga" activeMenu="calendar">
            <Head title="Kalender Komunitas & Tagihan" />

            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans min-h-screen flex flex-col">
                
                {/* Header & Tombol Navigasi Atas */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('warga.news.index')}
                            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 shadow-sm transition-all flex items-center justify-center shrink-0"
                            title="Kembali"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                Kalender Komunitas
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Jadwal kegiatan rutin dan acara khusus warga Siwarga05.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-3 py-1.5 shadow-sm gap-2">
                            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-gray-800 min-w-[100px] text-center">
                                {currentMonthName}
                            </span>
                            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <button 
                            onClick={goToToday}
                            className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 rounded-2xl shadow-sm cursor-pointer"
                        >
                            Hari Ini
                        </button>

                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#0D7A57] hover:bg-emerald-800 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Tambah Acara
                        </button>
                    </div>
                </div>

                {/* Filter Kategori */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center gap-4 sm:gap-6 overflow-x-auto">
                    <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider shrink-0">FILTER KATEGORI:</span>
                    {['Announcement', 'Event', 'Keamanan', 'Informasi', 'Keuangan'].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 select-none shrink-0">
                            <input 
                                type="checkbox" 
                                checked={activeFilters[cat] !== false} 
                                onChange={() => toggleFilter(cat)}
                                className="rounded border-gray-300 text-[#0D7A57] focus:ring-[#0D7A57]"
                            />
                            <span className={`w-2.5 h-2.5 rounded-full ${
                                cat === 'Announcement' ? 'bg-amber-500' :
                                cat === 'Event' ? 'bg-emerald-500' :
                                cat === 'Keamanan' ? 'bg-blue-500' :
                                cat === 'Informasi' ? 'bg-indigo-500' : 'bg-purple-500'
                            }`}></span>
                            {cat}
                        </label>
                    ))}
                </div>

                {/* Layout Grid Utama Kalender & Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start flex-1 mb-8">
                    
                    {/* KOLOM KIRI: Grid Kalender Bulanan */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4 text-center">
                            {['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'].map((day, idx) => (
                                <span key={idx} className="text-[9px] sm:text-[11px] font-bold text-gray-400 tracking-wider">
                                    {day}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                            {calendarDays.map((cell, index) => (
                                <div 
                                    key={index} 
                                    className={`min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between transition-all ${
                                        cell.dayNumber ? 'bg-gray-50/50 border-gray-100' : 'bg-transparent border-transparent'
                                    }`}
                                >
                                    <span className="text-xs font-bold text-gray-700">{cell.dayNumber}</span>
                                    
                                    <div className="space-y-1 overflow-y-auto max-h-[50px] sm:max-h-[65px]">
                                        {cell.items.map((ev) => (
                                            <div
                                                key={ev.id}
                                                onClick={() => setSelectedEvent(ev)}
                                                className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg truncate cursor-pointer transition-all shadow-xs ${
                                                    selectedEvent?.id === ev.id ? 'ring-2 ring-[#0D7A57]' : ''
                                                } ${
                                                    ev.type === 'bill' || ev.category === 'Keuangan' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                    ev.category === 'Keamanan' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    ev.category === 'Announcement' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                    ev.category === 'Informasi' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                                    'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                }`}
                                            >
                                                {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KOLOM KANAN: Detail & Akan Datang */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <h3 className="font-bold text-gray-900 text-sm">Detail Kegiatan</h3>
                                {selectedEvent && (
                                    <span className="text-xs font-bold text-[#0D7A57] bg-emerald-50 px-2.5 py-1 rounded-xl">
                                        {selectedEvent.date}
                                    </span>
                                )}
                            </div>

                            {selectedEvent ? (
                                <div className="space-y-4 text-xs">
                                    <div className="rounded-2xl overflow-hidden aspect-video bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                        <CalendarIcon className="w-12 h-12 text-[#0D7A57] opacity-60" />
                                    </div>

                                    <div>
                                        <span className="text-[9px] font-bold text-[#0D7A57] bg-emerald-50 px-2 py-0.5 rounded uppercase">
                                            {selectedEvent.category}
                                        </span>
                                        <h4 className="text-base font-bold text-gray-900 mt-2">{selectedEvent.title}</h4>
                                    </div>

                                    <div className="space-y-2 text-gray-600 pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>Waktu: {selectedEvent.time ? `${selectedEvent.time} WIB` : '08:00 WIB - Selesai'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>Lokasi: {selectedEvent.location || 'Balai Warga RT 05'}</span>
                                        </div>
                                        {selectedEvent.amount && (
                                            <div className="flex items-center gap-2 font-bold text-red-600">
                                                <Tag className="w-4 h-4 shrink-0" />
                                                <span>Nominal: Rp {Number(selectedEvent.amount).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-gray-50">
                                        <p className="font-semibold text-gray-700 mb-1">Deskripsi:</p>
                                        <p className="text-gray-500 leading-relaxed">{selectedEvent.description || 'Tidak ada keterangan tambahan.'}</p>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            type="button" 
                                            onClick={handleShare}
                                            className="w-full py-2.5 bg-[#0D7A57] hover:bg-emerald-800 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                        >
                                            <Share2 className="w-4 h-4" /> Bagikan Acara
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-10">Pilih acara di kalender untuk melihat detail.</p>
                            )}
                        </div>

                        {/* Widget Akan Datang */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Akan Datang</h4>
                            <div className="space-y-2">
                                {events.slice(0, 3).map((item) => (
                                    <div key={item.id} onClick={() => setSelectedEvent(item)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-gray-800 truncate">{item.title}</h5>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{item.date}</p>
                                        </div>
                                        <span className="text-[9px] font-bold px-2 py-0.5 bg-white rounded-lg border border-gray-200 text-gray-600 shrink-0">{item.category}</span>
                                    </div>
                                ))}
                            </div>

                            {paginatedEvents?.links && paginatedEvents.links.length > 3 && (
                                <div className="pt-2 border-t border-gray-100 overflow-x-auto">
                                    <Pagination links={paginatedEvents.links} />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                
                {/* Footer di dalam div utama, mendorong ke bawah */}
                <div className="mt-auto -mx-4 sm:-mx-6 md:-mx-8">
                    <Footer />
                </div>
            </div>

            {/* Modal Tambah Acara Pribadi */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-2 sm:hidden"></div>
                        <h3 className="text-base font-bold text-gray-900">Tambah Agenda Pribadi Rumah</h3>
                        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="font-semibold text-gray-700">Judul Acara</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full mt-1 px-3.5 py-2.5 border rounded-xl border-gray-200 focus:ring-[#0D7A57]"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="font-semibold text-gray-700">Tanggal</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border rounded-xl border-gray-200 [color-scheme:light]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-700">Waktu</label>
                                    <input
                                        type="time"
                                        value={data.time}
                                        onChange={(e) => setData('time', e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2.5 border rounded-xl border-gray-200 [color-scheme:light]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700">Lokasi</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="w-full mt-1 px-3.5 py-2.5 border rounded-xl border-gray-200"
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700">Kategori</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full mt-1 px-3.5 py-2.5 border rounded-xl border-gray-200 bg-white"
                                >
                                    <option value="Announcement">Announcement</option>
                                    <option value="Event">Event</option>
                                    <option value="Keamanan">Keamanan</option>
                                    <option value="Informasi">Informasi</option>
                                    <option value="Keuangan">Keuangan</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700">Deskripsi</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full mt-1 px-3.5 py-2.5 border rounded-xl border-gray-200"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-3 bg-[#0D7A57] text-white rounded-xl font-bold hover:bg-emerald-800 cursor-pointer shadow-sm"
                                >
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Sidebar>
    );
}