export default function AppLogo({ variant = 'light', className = '' }) {
    const isLight = variant === 'light';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isLight ? 'bg-white/15 backdrop-blur-sm' : 'bg-gradient-to-br from-emerald-600 to-teal-600'}`}>
                <svg viewBox="0 0 24 24" className={`w-6 h-6 ${isLight ? 'text-white' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5 12 3l9 6.5" />
                    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
                </svg>
            </div>
            <div>
                <p className={`font-bold leading-tight ${isLight ? 'text-white' : 'text-gray-800'}`}>SiWarga05</p>
                <p className={`text-xs leading-tight ${isLight ? 'text-white/70' : 'text-gray-500'}`}>Sistem Informasi Warga RT 05</p>
            </div>
        </div>
    );
}