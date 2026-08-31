import React from 'react';
import { Link } from '@inertiajs/react';
// 🛠️ PERBAIKAN: Impor FileText dari lucide-react
import { Edit, Trash2, Eye, Calendar, FileText } from 'lucide-react';

export default function NewsTable({ articles, onEdit, onDelete, role = 'sekretaris' }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-100">
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Article</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date Created</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
            {articles?.length > 0 ? (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Info Artikel & Gambar */}
                  <td className="p-4 flex items-center gap-3">
                    
                    {/* 💡 KONDISI PERBAIKAN: Cek ketersediaan gambar lampiran */}
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded-xl bg-gray-100 border border-gray-100 shrink-0"
                      />
                    ) : (
                      /* Tampilan Box Fallback yang Etis & Clean untuk Baris Tabel */
                      <div className="w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60 text-slate-400 shrink-0 select-none" title="Tanpa Gambar">
                        <FileText className="w-5 h-5 opacity-70" />
                        <span className="text-[7px] font-bold uppercase tracking-tight text-slate-400 mt-0.5 scale-90">
                          NO IMG
                        </span>
                      </div>
                    )}

                    <div className="max-w-xs md:max-w-md">
                      <h5 className="font-bold text-gray-800 line-clamp-1">{article.title}</h5>
                      <span className="text-xs text-gray-400 block mt-0.5">By {article.author}</span>
                    </div>
                  </td>
                  
                  {/* Kategori */}
                  <td className="p-4">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      article.category === 'Event' ? 'bg-sky-50 text-sky-600' : 
                      article.category === 'Keamanan' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {article.category}
                    </span>
                  </td>

                  {/* Status Penerbitan */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      article.status === 'published' ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${article.status === 'published' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      {article.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>

                  {/* Tanggal */}
                  <td className="p-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{article.date}</span>
                    </div>
                  </td>

                  {/* Tombol Aksi */}
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link 
                        href={route(`${role}.news.show`, article.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        title="View Article"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      {/* Tombol Edit hanya muncul jika role memiliki akses edit (misal sekretaris) */}
                      {role === 'sekretaris' && (
                        <Link 
                          href={route('sekretaris.news.edit', article.id)}
                          className="p-2 text-gray-400 hover:text-[#0D7A57] hover:bg-emerald-50 rounded-lg transition-all"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}

                      <button 
                        onClick={() => onDelete(article.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                  No articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}