import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        // Tambahan class: w-full sticky top-[100vh]
        <footer className="w-full sticky top-[100vh] bg-white border-t border-gray-100 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div className="text-center md:text-left">
                <h5 className="font-bold text-gray-700 text-sm">Siwarga05</h5>
                <p className="mt-1">© {new Date().getFullYear()} Siwarga05. Gotong Royong Digital untuk Lingkungan Harmonis.</p>
            </div>
        </footer>
    );
}