import React from 'react';
import { Bold, Italic, List, Link2, Image, Quote, Code } from 'lucide-react';

export default function NewsEditor({ value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
        Main Content
      </label>
      <div className={`border rounded-xl overflow-hidden ${error ? 'border-red-300' : 'border-gray-200'}`}>
        {/* Toolbar Editor */}
        <div className="bg-[#EEF2F6] border-b border-gray-200 px-4 py-2 flex flex-wrap gap-4 text-gray-500">
          <button type="button" className="hover:text-gray-900"><Bold className="w-4 h-4" /></button>
          <button type="button" className="hover:text-gray-900"><Italic className="w-4 h-4" /></button>
          <button type="button" className="hover:text-gray-900"><List className="w-4 h-4" /></button>
          <button type="button" className="hover:text-gray-900"><Link2 className="w-4 h-4" /></button>
          <button type="button" className="hover:text-gray-900"><Image className="w-4 h-4" /></button>
          <span className="text-gray-300">|</span>
          <button type="button" className="hover:text-gray-900"><Quote className="w-4 h-4" /></button>
          <button type="button" className="hover:text-gray-900"><Code className="w-4 h-4" /></button>
        </div>
        {/* Textarea Input */}
        <textarea 
          rows="8"
          value={value}
          onChange={onChange}
          placeholder={placeholder || "Start writing your community update here..."}
          className="w-full p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-white"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}