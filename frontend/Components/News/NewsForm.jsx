import React from 'react';
import { Image, Clock, FileText, CheckCircle, Send } from 'lucide-react';
import NewsEditor from './NewsEditor';

export default function NewsForm({ data, setData, errors, processing, onSubmit, mode = 'create', currentImage = null }) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* Kolom Kiri: Editor & Form Input (2/3 Grid) */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          
          {/* 1. News Title */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              News Title
            </label>
            <input 
              type="text"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
              placeholder="e.g., Kerja Bakti Mingguan RT 05: Revitalisasi Taman"
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition-all"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* 2. Category & Featured Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={data.category}
                onChange={e => setData('category', e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition-all appearance-none"
              >
                <option value="Announcement">Announcement</option>
                <option value="Event">Event</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Informasi">Informasi</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Featured Tag
              </label>
              <input 
                type="text"
                value={data.featured_tag}
                onChange={e => setData('featured_tag', e.target.value)}
                placeholder="e.g., #GotongRoyong"
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 3. Cover Image Box */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Cover Image
            </label>
            
            {/* Tampilkan gambar lama jika di mode Edit */}
            {mode === 'edit' && currentImage && !data.cover_image && (
              <div className="mb-3 relative rounded-2xl overflow-hidden h-40 w-full max-w-md border border-gray-100">
                <img src={currentImage} alt="Current Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">Current Image</span>
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-[#F8FAFC] hover:bg-gray-50/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[150px] relative">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-gray-400 mb-3">
                <Image className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {data.cover_image ? data.cover_image.name : mode === 'edit' ? 'Click to change image or drag and drop' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB (16:9 recommended)</p>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                accept="image/*"
                onChange={e => setData('cover_image', e.target.files[0])}
              />
            </div>
            {errors.cover_image && <p className="text-red-500 text-xs mt-1">{errors.cover_image}</p>}
          </div>

          {/* 4. Main Content Editor */}
          <NewsEditor 
            value={data.main_content}
            onChange={e => setData('main_content', e.target.value)}
            error={errors.main_content}
          />

        </div>
      </div>

      {/* Kolom Kanan: Sidebar Options (1/3 Grid) */}
      <div className="space-y-6">
        {/* Widget 1: Publishing Options */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Clock className="w-4 h-4 text-[#0D7A57]" />
            <h3 className="font-bold text-sm text-gray-800">Publishing Options</h3>
          </div>

          <div className="space-y-3">
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              data.publish_type === 'now' ? 'border-[#0D7A57] bg-[#E8F5E9]/30' : 'border-gray-100 bg-[#F8FAFC] hover:bg-gray-50'
            }`}>
              <input 
                type="radio" 
                name="publish_type" 
                value="now"
                checked={data.publish_type === 'now'}
                onChange={() => setData('publish_type', 'now')}
                className="mt-0.5 accent-[#0D7A57]"
              />
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  {mode === 'edit' ? 'Update & Publish Now' : 'Publish Now'}
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">Immediate visible to residents</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              data.publish_type === 'schedule' ? 'border-[#0D7A57] bg-[#E8F5E9]/30' : 'border-gray-100 bg-[#F8FAFC] hover:bg-gray-50'
            }`}>
              <input 
                type="radio" 
                name="publish_type" 
                value="schedule"
                checked={data.publish_type === 'schedule'}
                onChange={() => setData('publish_type', 'schedule')}
                className="mt-0.5 accent-[#0D7A57]"
              />
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  {mode === 'edit' ? 'Keep Scheduled' : 'Schedule'}
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">Pick a future date & time</span>
              </div>
            </label>
          </div>

          <div className="flex justify-between items-center text-xs pt-2">
            <span className="text-gray-400 font-medium">Visibility:</span>
            <span className="font-bold text-[#0D7A57]">Public (All Residents)</span>
          </div>

          <button 
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-[#0D7A57] hover:bg-[#0A6145] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <Send className="w-4 h-4 transform rotate-45 -mt-0.5" />
            <span>{mode === 'edit' ? 'Update Article' : 'Publish Article'}</span>
          </button>
        </div>

        {/* Widget 2: Recent Drafts */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-sm text-gray-800">Recent Drafts</h3>
            </div>
            <span className="bg-gray-100 text-gray-500 font-bold text-[10px] px-2 py-0.5 rounded-full">3 total</span>
          </div>
          <div className="space-y-4">
            <div className="group cursor-pointer">
              <h4 className="text-xs font-bold text-gray-700 group-hover:text-[#0D7A57] transition-colors truncate">Laporan Keuangan Juli...</h4>
              <span className="text-[10px] text-gray-400 block mt-1">Edited 2 hours ago</span>
            </div>
            <div className="group cursor-pointer">
              <h4 className="text-xs font-bold text-gray-700 group-hover:text-[#0D7A57] transition-colors truncate">Undangan Rapat 17an</h4>
              <span className="text-[10px] text-gray-400 block mt-1">Edited Yesterday</span>
            </div>
          </div>
        </div>

        {/* Widget 3: Publishing Guidelines */}
        <div className="bg-[#F4F9F6] rounded-3xl p-6 border border-emerald-50/50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-[#0D7A57]" />
            <h3 className="font-bold text-sm text-gray-800">Publishing Guidelines</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-gray-600 list-disc list-inside marker:text-emerald-600">
            <li>Keep headlines concise & clear.</li>
            <li>Include high-quality photos.</li>
            <li>Tag relevant categories for easy discovery.</li>
            <li>Respect resident privacy.</li>
          </ul>
        </div>
      </div>

    </form>
  );
}