import React, { useState, useEffect } from 'react';
import { router, Link, usePage, Head } from '@inertiajs/react';
import { 
    LayoutDashboard, Users, Home, Newspaper, CreditCard, 
    AlertTriangle, Bell, User, Settings, LogOut, ShieldCheck, Menu, X, UserX, Globe 
} from 'lucide-react';

const ROLE_ROUTE_PREFIXES = {
    warga: 'warga',
    sekretaris: 'sekretaris',
    bendahara: 'bendahara',
    ketua_rt: 'ketuart',
    ketuart: 'ketuart',
    superadmin: 'superadmin',
    super_admin: 'superadmin',
    admin: 'superadmin'
};

const safeRoute = (name, params) => {
    try {
        return route(name, params);
    } catch (e) {
        console.error(`[ZIGGY ERROR] Route "${name}" tidak ditemukan di web.php / Ziggy!`, e);
        return '#';
    }
};

const getMenus = (currentRole) => {
    const normalizedRole = currentRole === 'ketua_rt' ? 'ketuart' : currentRole;
    const prefix = ROLE_ROUTE_PREFIXES[currentRole] || ROLE_ROUTE_PREFIXES[normalizedRole] || 'warga';
    const isSuperAdmin = ['superadmin', 'super_admin', 'admin'].includes(currentRole);

    return [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: !isSuperAdmin ? safeRoute(`${prefix}.dashboard`) : '#',
            roles: ['warga', 'sekretaris', 'bendahara', 'ketua_rt', 'ketuart']
        },
        {
            id: 'kelola-pengurus',
            label: 'Kelola Pengurus',
            icon: ShieldCheck,
            href: isSuperAdmin ? safeRoute('superadmin.pengurus.index') : '#',
            roles: ['superadmin', 'super_admin', 'admin']
        },
        {
            id: 'kelola-landing',
            label: 'Kelola Landing Page',
            icon: Globe,
            href: isSuperAdmin ? safeRoute('superadmin.landing.index') : '#',
            roles: ['superadmin', 'super_admin', 'admin']
        },
        {
            id: 'data-warga',
            label: 'Data Warga',
            icon: Users,
            href: ['sekretaris', 'bendahara', 'ketua_rt', 'ketuart'].includes(currentRole) ? safeRoute(`${prefix}.data-warga.index`) : '#',
            roles: ['sekretaris', 'bendahara', 'ketua_rt', 'ketuart']
        },
        {
            id: 'warga-nonaktif',
            label: 'Data Warga Nonaktif',
            icon: UserX,
            href: ['ketua_rt', 'ketuart'].includes(currentRole) ? safeRoute(`${prefix}.warganonaktif.index`) : '#',
            roles: ['ketua_rt', 'ketuart']
        },
        {
            id: 'house-mgmt',
            label: 'Data Rumah',
            icon: Home,
            href: !isSuperAdmin ? safeRoute(`${prefix}.house.index`) : '#',
            roles: ['warga', 'sekretaris', 'bendahara', 'ketua_rt', 'ketuart']
        },
        {
            id: 'news',
            label: 'Berita',
            icon: Newspaper,
            href: !isSuperAdmin ? safeRoute(`${prefix}.news.index`) : '#',
            roles: ['warga', 'sekretaris', 'bendahara', 'ketua_rt', 'ketuart']
        },
        {
            id: 'finance',
            label: 'Bayar Iuran',
            icon: CreditCard,
            href: !isSuperAdmin ? safeRoute(`${prefix}.dues.index`) : '#',
            roles: ['warga', 'sekretaris', 'bendahara', 'ketua_rt', 'ketuart']
        },
        {
            id: 'laporan',
            label: 'LaporanAja',
            icon: AlertTriangle,
            href: !isSuperAdmin ? safeRoute(`${prefix}.laporan.index`) : '#',
            roles: ['warga', 'sekretaris', 'bendahara', 'ketua_rt', 'ketuart']
        },
        {
            id: 'notifications',
            label: 'Notifikasi',
            icon: Bell,
            href: !isSuperAdmin ? safeRoute(`${prefix}.notifikasi.index`) : '#',
            roles: ['warga', 'sekretaris', 'ketua_rt', 'ketuart', 'bendahara']
        },
        {
            id: 'profile',
            label: 'Profil',
            icon: User,
            href: !isSuperAdmin ? safeRoute(`${prefix}.profile.index`) : '#',
            roles: ['warga', 'sekretaris', 'bendahara', 'ketua_rt', 'ketuart']
        },
    ];
};

const ROLES = {
    warga: { label: 'Warga RT 05' },
    sekretaris: { label: 'Sekretaris RT 05' },
    bendahara: { label: 'Bendahara RT 05' },
    ketua_rt: { label: 'Ketua RT 05' },
    ketuart: { label: 'Ketua RT 05' },
    superadmin: { label: 'Developer / Super Admin' },
    super_admin: { label: 'Developer / Super Admin' },
    admin: { label: 'Developer / Super Admin' },
};

export default function Sidebar({ currentRole = 'warga', activeMenu, children }) {
    const { props } = usePage();
    const user = props.auth?.user;
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    useEffect(() => {
        if (mobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        const handleEsc = (e) => {
            if (e.key === 'Escape') setMobileSidebarOpen(false);
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [mobileSidebarOpen]);

    const filteredMenus = getMenus(currentRole).filter(menu => 
        menu.roles.includes(currentRole) || (currentRole === 'ketua_rt' && menu.roles.includes('ketuart'))
    );

    const normalizedRole = currentRole === 'ketua_rt' ? 'ketuart' : currentRole;
    const currentPrefix = ROLE_ROUTE_PREFIXES[currentRole] || ROLE_ROUTE_PREFIXES[normalizedRole] || 'warga';
    const isSuperAdmin = ['superadmin', 'super_admin', 'admin'].includes(currentRole);

    const sidebarContent = (
        <div className="flex flex-col justify-between h-full p-6">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-bold text-[#0D7A57]">Siwarga05</h1>
                    <button 
                        onClick={() => setMobileSidebarOpen(false)}
                        aria-label="Tutup menu"
                        className="p-2 text-gray-400 rounded-lg md:hidden hover:text-gray-600 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-gray-50">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
                        {user?.photo ? (
                            <img 
                                src={user.photo_url || user.photo} 
                                alt="Foto Profil" 
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <User className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-850 truncate">
                            {user?.name || 'User Siwarga'}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-medium truncate">
                            {ROLES[currentRole]?.label || 'Warga RT 05'}
                        </p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {filteredMenus.map((menu) => {
                        const IconComponent = menu.icon;
                        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                        
                        let isActive = false;
                        if (activeMenu) {
                            isActive = activeMenu === menu.id;
                        } else if (menu.href !== '#') {
                            try {
                                const urlObj = new URL(menu.href);
                                const menuPath = urlObj.pathname;
                                
                                if (menu.id === 'dashboard') {
                                    isActive = currentPath === menuPath || currentPath.endsWith('/dashboard');
                                } else {
                                    isActive = currentPath.startsWith(menuPath);
                                }
                            } catch (err) {
                                isActive = currentPath === menu.href;
                            }
                        }

                        return (
                            <Link
                                key={menu.id}
                                href={menu.href}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`flex items-center justify-between px-4 py-3 md:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'bg-[#0D7A57] text-white font-semibold shadow-xs' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    <span>{menu.label}</span>
                                </div>

                                {menu.id === 'news' && ['sekretaris', 'bendahara', 'ketua_rt', 'ketuart'].includes(currentRole) && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold tracking-wide ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                        KELOLA
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <hr className="my-6 border-gray-100" />
            </div>

            <div className="pt-4 space-y-1 border-t border-gray-50">
                {!isSuperAdmin && (
                    <Link 
                        href={safeRoute(`${currentPrefix}.pengaturan.index`)} 
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 md:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                            typeof window !== 'undefined' && window.location.pathname.includes('/pengaturan')
                                ? 'bg-[#0D7A57] text-white font-semibold shadow-xs'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Settings className={`w-5 h-5 shrink-0 ${typeof window !== 'undefined' && window.location.pathname.includes('/pengaturan') ? 'text-white' : 'text-gray-400'}`} /> 
                        Pengaturan
                    </Link>
                )}

                <button 
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-xs font-medium text-left text-red-600 transition-colors md:py-2 hover:bg-red-50 rounded-xl sm:text-sm cursor-pointer"
                >
                    <LogOut className="w-5 h-5 shrink-0" /> Keluar
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] w-full font-sans">
            <Head>
                <title>SIWARGA05</title>
                <link rel="icon" type="image/png" href="/images/logort05.png" />
            </Head>

            <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0 sticky top-0 h-screen z-40">
                {sidebarContent}
            </aside>

            <div 
                className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 bg-white border-b border-gray-200 md:hidden"
                style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(4rem + env(safe-area-inset-top))' }}
            >
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMobileSidebarOpen(true)}
                        aria-label="Buka menu"
                        className="p-2 text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-base font-bold text-[#0D7A57]">Siwarga05</span>    
                </div>
                <div className="flex items-center justify-center w-9 h-9 overflow-hidden bg-gray-100 rounded-full">
                    {user?.photo ? (
                        <img src={user.photo_url || user.photo} alt="Avatar" className="object-cover w-full h-full" />
                    ) : (
                        <User className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </div>

            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 transition-opacity bg-black/50 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div 
                className={`md:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
                role="dialog"
                aria-modal="true"
            >
                {sidebarContent}
            </div>

            <main 
                className="flex-1 overflow-y-auto bg-[#F8FAFC] min-w-0"
                style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}
            >
                <div className="md:hidden" />
                {children}
            </main>
        </div>
    );
}