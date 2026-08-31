import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, ChevronRight, Edit, Trash2, FileText, Shield, CalendarDays, Megaphone } from 'lucide-react';

export default function NewsCard({ article, isAdmin = false, onEdit, onDelete, baseUrl = 'warga.news.show' }) {
  const [imageError, setImageError] = useState(false);

  // Icon & warna berdasarkan kategori
  const categoryStyle = {
    Event:       { icon: CalendarDays, bg: 'bg-sky-50',   text: 'text-sky-500',   badge: 'bg-sky-500' },
    Keamanan:    { icon: Shield,       bg: 'bg-rose-50',  text: 'text-rose-500',  badge: 'bg-rose-500' },
    Keuangan:    { icon: FileText,     bg: 'bg-violet-50',text: 'text-violet-500',badge: 'bg-violet-500' },
    Announcement:{ icon: Megaphone,    bg: 'bg-amber-50', text: 'text-amber-500', badge: 'bg-amber-500' },
  };

  const style = categoryStyle[article.category] || { icon: FileText, bg: 'bg-slate-50', text: 'text-slate-400', badge: 'bg-amber-500' };
  const IconComponent = style.icon;

  const showImage = article.image && !imageError;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Thumbnail Image / Placeholder */}
        <div className="h-48 overflow-hidden relative">
          {showImage ? (
            <img 
              src={article.image} 
              alt={article.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full ${style.bg} flex flex-col items-center justify-center gap-2`}>
              <div className={`w-14 h-14 rounded-2xl ${style.bg} border border-current/10 flex items-center justify-center ${style.text}`}>
                <IconComponent className="w-7 h-7 opacity-60" />
              </div>
              <span className={`text-[10px] font-semibold ${style.text} opacity-50`}>
                {article.category || 'Informasi'}
              </span>
            </div>
          )}
          <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow-sm text-white ${style.badge}`}>
            {article.category}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="text-[11px] text-gray-400 mb-2 flex items-center gap-2">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
            <span>•</span>
            <span>By {article.author}</span>
          </div>
          <h4 className="font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#0D7A57] transition-colors">
            {article.title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        </div>
      </div>

      {/* Footer Kontrol Aksi */}
      <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <Link 
          href={route(baseUrl, article.id)} 
          className="text-xs font-bold text-[#0D7A57] hover:underline flex items-center gap-1"
        >
          Baca Selengkapnya.. <ChevronRight className="w-3 h-3" />
        </Link>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button onClick={() => onEdit(article.id)} className="text-gray-400 hover:text-gray-700 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(article.id)} className="text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}