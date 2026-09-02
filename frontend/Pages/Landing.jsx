import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from "@inertiajs/react";
import { ArrowRight, MapPin, Clock, Phone, Users, Briefcase, Wallet, Building2, AlertCircle, Menu, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Animation Helpers                                                */
/* ------------------------------------------------------------------ */

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
            {...rest}
        >
            {children}
        </Tag>
    );
}

function CountUp({ value, suffix = '', duration = 1400 }) {
    const ref = useRef(null);
    const [display, setDisplay] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();

                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setDisplay(Math.round(eased * value));
                        if (progress < 1) requestAnimationFrame(tick);
                    };

                    requestAnimationFrame(tick);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref}>
            {display}
            {suffix}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Page Component                                                   */
/* ------------------------------------------------------------------ */

export default function Landing({ news = [], totalWarga = 0, totalKK = 0, galleries = [], homeData = {} }) {
    const handleNavigation = (path) => {
        router.visit(path);
    };

    const mapCoordinates = '-6.251735,106.878688';

    const [activeSection, setActiveSection] = useState('beranda');
    const [scrolled, setScrolled] = useState(false);
    const [heroMounted, setHeroMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const t = requestAnimationFrame(() => setHeroMounted(true));
        return () => cancelAnimationFrame(t);
    }, []);

    const handleScroll = useCallback(() => {
        const sections = ['beranda', 'tentang', 'berita', 'galeri', 'lokasi'];
        const scrollPosition = window.scrollY + 150;

        for (const section of sections) {
            const element = document.getElementById(section);
            if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                setActiveSection(section);
            }
        }

        setScrolled(window.scrollY > 20);

        if (window.scrollY < 50) {
            setActiveSection('beranda');
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const displayNews = news
        .filter((item) => item.author_role !== 'bendahara')
        .slice(0, 3);

    const navLinks = [
        { id: 'beranda', label: 'Beranda', href: '#beranda' },
        { id: 'tentang', label: 'Tentang Kami', href: '#tentang' },
        { id: 'berita', label: 'Berita', href: '#berita' },
        { id: 'galeri', label: 'Galeri', href: '#galeri' },
        { id: 'lokasi', label: 'Lokasi', href: '#lokasi' },
    ];

    return (
        <>
            <Head title={`Home${homeData.hero_highlight ? ` - ${homeData.hero_highlight}` : ''}`} />

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes slowZoom {
                    from { transform: scale(1); }
                    to   { transform: scale(1.1); }
                }

                .reveal {
                    opacity: 0;
                    transform: translateY(28px);
                    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .hero-item {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hero-mounted .hero-item {
                    opacity: 1;
                    transform: translateY(0);
                }

                .nav-underline {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    width: 100%;
                    background: #0D7A57;
                    border-radius: 4px 4px 0 0;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .nav-link:hover .nav-underline,
                .nav-link[data-active="true"] .nav-underline {
                    transform: scaleX(1);
                }

                .feature-card, .news-card, .gallery-card {
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
                }
                .feature-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(13, 122, 87, 0.25);
                }
                .news-card:hover {
                    transform: translateY(-6px);
                }
                .gallery-card:hover {
                    transform: translateY(-6px);
                }

                .icon-badge {
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease;
                }
                .feature-card:hover .icon-badge {
                    transform: scale(1.12) rotate(-4deg);
                }

                .cta-btn {
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, box-shadow 0.3s ease;
                }
                .cta-btn:hover {
                    transform: translateY(-2px);
                }
                .cta-arrow {
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .cta-btn:hover .cta-arrow {
                    transform: translateX(4px);
                }

                .link-arrow {
                    display: inline-block;
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .link-hover:hover .link-arrow {
                    transform: translateX(3px);
                }

                .navbar-scrolled {
                    box-shadow: 0 8px 24px -12px rgba(15, 23, 42, 0.12);
                }
                .hero-bg-img {
                    animation: slowZoom 18s ease-out forwards;
                }
            `}</style>

            <div className="min-h-screen bg-white font-sans text-slate-800 antialiased overflow-x-hidden">

                {/* NAVBAR STICKY */}
                <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
                    scrolled || mobileMenuOpen
                        ? 'bg-white/95 backdrop-blur-sm border-b border-slate-100 navbar-scrolled'
                        : 'bg-transparent border-b border-transparent'
                }`}>
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 md:px-12">
                        <div className="flex items-center">
                            <span className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${scrolled || mobileMenuOpen ? 'text-[#0D7A57]' : 'text-white'}`}>
                                Siwarga05
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex justify-center items-center gap-8 text-[15px] font-medium">
                            {navLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={link.href}
                                    data-active={activeSection === link.id}
                                    className={`nav-link relative py-2 transition-colors duration-300 ${
                                        activeSection === link.id
                                            ? (scrolled ? 'text-[#0D7A57] font-bold' : 'text-white font-bold')
                                            : (scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-white/75 hover:text-white')
                                    }`}
                                >
                                    {link.label}
                                    <span className={`nav-underline ${scrolled ? '' : '!bg-white'}`}></span>
                                </a>
                            ))}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex justify-end items-center gap-3">
                            <button
                                onClick={() => handleNavigation('/login')}
                                className={`cta-btn rounded-full px-5 py-2 text-sm font-bold transition-colors duration-300 ${
                                    scrolled ? 'bg-[#E8F5E9] text-[#0D7A57] hover:bg-[#cce8d1]' : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25'
                                }`}
                            >
                                Masuk
                            </button>
                            <button
                                onClick={() => handleNavigation('/register')}
                                className="cta-btn rounded-full bg-[#0D7A57] px-5 py-2 text-sm font-bold text-white hover:bg-[#0A6145]"
                            >
                                Daftar
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`p-2 rounded-xl transition-colors ${
                                    scrolled || mobileMenuOpen ? 'text-slate-800 bg-slate-100' : 'text-white bg-white/10'
                                }`}
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl px-6 py-6 space-y-4">
                            <div className="flex flex-col space-y-3">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.id}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-base font-medium py-2 transition-colors ${
                                            activeSection === link.id ? 'text-[#0D7A57] font-bold' : 'text-slate-600 hover:text-[#0D7A57]'
                                        }`}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                <button
                                    onClick={() => { setMobileMenuOpen(false); handleNavigation('/login'); }}
                                    className="w-full rounded-full py-3 text-sm font-bold bg-[#E8F5E9] text-[#0D7A57] text-center"
                                >
                                    Masuk
                                </button>
                                <button
                                    onClick={() => { setMobileMenuOpen(false); handleNavigation('/register'); }}
                                    className="w-full rounded-full py-3 text-sm font-bold bg-[#0D7A57] text-white text-center shadow-md"
                                >
                                    Daftar
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* HERO SECTION */}
                <header id="beranda" className={`relative isolate w-full min-h-[85vh] sm:min-h-[88vh] flex items-center overflow-hidden bg-[#08211A] ${heroMounted ? 'hero-mounted' : ''}`}>
                    <div className="absolute inset-0 -z-30">
                        <img
                            src={homeData.bg_image || "/images/rumah.png"}
                            alt="Lingkungan Perumahan Warga"
                            className="hero-bg-img w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 -z-20 bg-[#08211A] mix-blend-multiply opacity-45"></div>
                    <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#08211A]/85 via-[#08211A]/45 to-transparent"></div>
                    <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#08211A]/55 via-transparent to-transparent"></div>

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-28 pb-32 w-full">
                        <div className="max-w-2xl text-left">
                            <h1 className="hero-item text-3xl sm:text-[52px] lg:text-[64px] font-extrabold tracking-tight text-white leading-[1.1] mb-4 sm:mb-6" style={{ transitionDelay: '100ms' }}>
                                <span className="block">
                                    <span 
                                        className="block whitespace-pre-line" 
                                        dangerouslySetInnerHTML={{ __html: (homeData.hero_title || 'Sistem Informasi Lingkungan RT 05').replace(/\n/g, '<br />') }} 
                                    />
                                    {homeData.hero_highlight && (
                                        <span 
                                            className="block mt-1" 
                                            style={{ color: homeData.hero_highlight_color || '#34d399' }}
                                        >
                                            {homeData.hero_highlight}
                                        </span>
                                    )}
                                </span>
                            </h1>
                            <p className="hero-item text-sm sm:text-lg text-emerald-50/80 leading-relaxed mb-8 sm:mb-9 max-w-md" style={{ transitionDelay: '220ms' }}>
                                {homeData.hero_subtitle || 'Menghubungkan warga, menyederhanakan administrasi, dan mempererat tali silaturahmi secara transparan dan efisien.'}
                            </p>
                            <div className="hero-item flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4" style={{ transitionDelay: '340ms' }}>
                                <button
                                    onClick={() => handleNavigation('/register')}
                                    className="cta-btn inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#0A5C42] hover:bg-emerald-50 shadow-lg shadow-black/20"
                                >
                                    Daftar Sekarang
                                    <ArrowRight className="cta-arrow w-4 h-4" />
                                </button>
                                <a
                                    href="#tentang"
                                    className="cta-btn text-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-white hover:bg-white/20"
                                >
                                    Pelajari Lebih Lanjut
                                </a>
                            </div>
                        </div>
                    </div>

                    <svg
                        className="absolute bottom-0 left-0 w-full h-[40px] sm:h-[60px]"
                        viewBox="0 0 1440 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M0,40 C240,100 480,0 720,30 C960,60 1200,110 1440,50 L1440,100 L0,100 Z"
                            fill="#FAFAFA"
                        />
                    </svg>
                </header>

                {/* TENTANG KAMI SECTION */}
                <section id="tentang" className="py-16 sm:py-24 bg-[#FAFAFA] border-t border-slate-100 scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
                        <Reveal className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
                            <span className="text-[#0D7A57] font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Informasi Resmi</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-2">Tentang RT 05 / RW 08</h2>
                            <p className="text-sm text-slate-500">Mewujudkan lingkungan pemukiman yang modern, aman, dan transparan.</p>
                        </Reveal>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            
                            {/* Kotak Statistik Wilayah dengan CountUp */}
                            <Reveal className="lg:col-span-5 bg-[#0D7A57] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">RT 05 / RW 08</h3>
                                        <p className="text-xs text-emerald-100">Kebon Pala</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 my-6 sm:my-8">
                                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                        <span className="text-xl sm:text-2xl font-black block mb-1">
                                            <CountUp value={totalWarga} suffix="+" />
                                        </span>
                                        <span className="text-xs text-emerald-100">Total Warga Aktif</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                        <span className="text-xl sm:text-2xl font-black block mb-1">
                                            <CountUp value={totalKK} />
                                        </span>
                                        <span className="text-xs text-emerald-100">Kepala Keluarga</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs text-emerald-50 border-t border-white/10 pt-4">
                                    <p>📍 Lokasi: Jakarta, Indonesia</p>
                                    <p>👤 Ketua RT: Pengurus RT 05</p>
                                    <p>📞 Layanan Warga: 24/7 Siaga</p>
                                </div>
                            </Reveal>

                            {/* 4 Fitur Utama */}
                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: Users, bg: 'bg-blue-50', color: 'text-blue-600', title: 'Data Warga', desc: 'Pendataan kependudukan, kartu keluarga, dan profil warga secara digital.' },
                                    { icon: Briefcase, bg: 'bg-rose-50', color: 'text-rose-600', title: 'Berita', desc: 'Informasi pengumuman kegiatan dan agenda penting lingkungan RT.' },
                                    { icon: Wallet, bg: 'bg-amber-50', color: 'text-amber-600', title: 'Iuran & Keuangan', desc: 'Transparansi kas warga, pembayaran iuran, dan rekapitulasi keuangan.' },
                                    { icon: AlertCircle, bg: 'bg-purple-50', color: 'text-purple-600', title: 'LaporanAja', desc: 'Layanan aspirasi dan pengaduan warga cepat tanggap untuk pengurus.' },
                                ].map((f, i) => (
                                    <Reveal
                                        key={f.title}
                                        delay={i * 90}
                                        className="feature-card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className={`icon-badge w-10 h-10 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-4`}>
                                                <f.icon className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-base mb-1.5">{f.title}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>

                        </div>
                    </div>
                </section>

                {/* BERITA & INFORMASI SECTION */}
                <section id="berita" className="py-16 sm:py-24 scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
                        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Berita & Informasi</h2>
                                <p className="text-sm text-slate-500">Pembaruan terkini seputar kegiatan lingkungan kita.</p>
                            </div>
                            <button
                                onClick={() => handleNavigation('/berita')}
                                className="link-hover text-sm font-bold text-[#0D7A57] hover:underline flex items-center gap-1 self-start sm:self-auto"
                            >
                                Lihat Semua Berita <span className="link-arrow">›</span>
                            </button>
                        </Reveal>

                        {displayNews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                {displayNews.map((item, i) => (
                                    <Reveal
                                        key={item.id}
                                        delay={i * 100}
                                        className="news-card bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md flex flex-col group"
                                    >
                                        <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold bg-slate-100">
                                                    Tanpa Foto
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                                <Clock className="w-3.5 h-3.5" />
                                                {item.date}
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{item.title}</h4>
                                            <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-grow">{item.excerpt}</p>
                                            <button
                                                onClick={() => handleNavigation(`/berita/${item.slug || item.id}`)}
                                                className="link-hover text-[#0D7A57] font-bold text-sm flex items-center gap-1 mt-auto"
                                            >
                                                Baca Selengkapnya <span className="link-arrow">›</span>
                                            </button>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        ) : (
                            <Reveal className="bg-[#FAFAFA] p-8 sm:p-12 text-center rounded-3xl border border-slate-100">
                                <p className="text-slate-500 text-sm">Belum ada berita atau pengumuman terbaru.</p>
                            </Reveal>
                        )}
                    </div>
                </section>

                {/* GALERI KEGIATAN WARGA SECTION */}
                <section id="galeri" className="py-16 sm:py-24 bg-[#FAFAFA] border-t border-slate-100 scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
                        <Reveal className="text-center mb-10 sm:mb-14">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Galeri Kegiatan Warga</h2>
                            <p className="text-sm text-slate-500">Momen-momen kebersamaan yang terekam dalam bingkai harmoni komunitas kita.</p>
                        </Reveal>

                        {galleries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {galleries.map((g, i) => (
                                    <Reveal 
                                        key={g.id || i} 
                                        delay={i * 90} 
                                        className="gallery-card bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md flex flex-col group"
                                    >
                                        <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                                            <img
                                                src={g.image_url}
                                                alt={g.title || 'Galeri Warga'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                📷 Dokumentasi
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                                                {g.title || 'Kegiatan Warga RT 05'}
                                            </h4>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                                Dokumentasi momen kebersamaan dan aktivitas gotong royong warga lingkungan RT 05 / RW 08.
                                            </p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-slate-500 text-sm">Belum ada foto galeri yang diunggah oleh Super Admin.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* PUSAT LAYANAN & LOKASI SECTION */}
                <section id="lokasi" className="py-16 sm:py-24 scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <Reveal className="w-full lg:w-1/2">
                            <div className="bg-white p-3 rounded-3xl shadow-md border border-slate-100">
                                <div className="rounded-2xl overflow-hidden aspect-[4/3] relative bg-slate-100">
                                    <iframe
                                        title="Peta Lokasi Wilayah RT 05"
                                        src={`https://www.google.com/maps?q=${mapCoordinates}&z=17&output=embed`}
                                        className="w-full h-full border-0"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${mapCoordinates}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-hover inline-flex items-center gap-1 mt-4 text-sm font-bold text-[#0D7A57] hover:underline"
                            >
                                Lihat Wilayah di Google Maps <span className="link-arrow">›</span>
                            </a>
                        </Reveal>
                        <Reveal delay={120} className="w-full lg:w-1/2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">Pusat Layanan Warga</h2>
                            <p className="text-sm text-slate-500 mb-8">Tim pengurus lingkungan kami siap membantu kebutuhan administrasi dan informasi Anda.</p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#0D7A57] bg-emerald-50 p-2.5 rounded-xl shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">Wilayah RT 05 / RW 08</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">Kebon Pala, Kecamatan Makasar<br/>Kota Jakarta Timur, DKI Jakarta 13210</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#0D7A57] bg-emerald-50 p-2.5 rounded-xl shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">Jam Respon Pengurus</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">Senin - Jumat: 08:00 - 20:00 WIB<br/>Sabtu - Minggu: 09:00 - 15:00 WIB<br/>*(Layanan Sistem Digital: 24/7)*</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#0D7A57] bg-emerald-50 p-2.5 rounded-xl shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">Kontak Darurat & Bantuan</h4>
                                        <p className="text-sm text-slate-500">Pos Keamanan / Satpam: (021) 555-0199</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

               {/* FOOTER */}
                <footer className="bg-[#0D7A57] text-white pt-16 sm:pt-20 pb-12 border-t border-emerald-800 relative overflow-hidden">
                    <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-16 border-b border-white/15 relative z-10 items-center">
                        
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black tracking-tight text-white">
                                    Si<span className="text-emerald-200">Warga05</span>
                                </span>
                                <span className="bg-white/10 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                                    Official Portal
                                </span>
                            </div>
                            <p className="text-sm text-emerald-50/80 max-w-md leading-relaxed">
                                Platform digital gotong royong warga RT 05 / RW 08 untuk mewujudkan lingkungan pemukiman yang transparan, aman, dan terintegrasi.
                            </p>
                            <div className="pt-2 text-xs text-emerald-50/80 space-y-1.5">
                                <p className="font-semibold text-white">📍 Alamat RT 05:</p>
                                <p>RT.5/RW.8, Kb. Pala, Kec. Makasar, Kota Jakarta Timur, DKI Jakarta 13210</p>
                            </div>
                        </div>

                        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/90 p-6 rounded-3xl border border-white/30 backdrop-blur-md shadow-lg text-slate-800">
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-[#0D7A57] mb-4">Peta Situs</h4>
                                <ul className="space-y-2.5 text-xs text-slate-600">
                                    <li><a href="#beranda" className="hover:text-[#0D7A57] transition-colors font-medium">Beranda</a></li>
                                    <li><a href="#tentang" className="hover:text-[#0D7A57] transition-colors font-medium">Tentang Kami</a></li>
                                    <li><a href="#berita" className="hover:text-[#0D7A57] transition-colors font-medium">Berita Warga</a></li>
                                    <li><a href="#galeri" className="hover:text-[#0D7A57] transition-colors font-medium">Galeri Kegiatan</a></li>
                                    <li><a href="#lokasi" className="hover:text-[#0D7A57] transition-colors font-medium">Lokasi</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-[#0D7A57] mb-4">Pusat Bantuan</h4>
                                <div className="space-y-3 text-xs text-slate-600">
                                    <div>
                                        <span className="block text-[10px] text-slate-400">WhatsApp Darurat</span>
                                        <span className="font-bold text-slate-900">+62 81234567</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-slate-400">Email Resmi</span>
                                        <span className="font-bold text-slate-900">Siwarga05@gmail.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/70 relative z-10 text-center sm:text-left">
                        <p>© 2026 SIWARGA. Hak Cipta Dilindungi Undang-Undang.</p>
                        <p>Crafted with passion by <span className="text-white font-semibold">Mhmdfahriy</span></p>
                    </div>
                </footer>

            </div>
        </>
    );
}