import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

export default function TextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    // Setiap kali ada perubahan ketikan, kirim hasilnya (HTML string) ke parent state (Inertia useForm)
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sinkronisasi data jika ada perubahan value dari luar (terutama saat load data di Edit.jsx)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-[#0D7A57] focus-within:ring-1 focus-within:ring-[#0D7A57]">
      {/* Menu Bar / Toolbar Atas */}
      <div className="flex flex-wrap items-center gap-1 bg-gray-50 p-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-emerald-100 text-[#0D7A57]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-emerald-100 text-[#0D7A57]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-emerald-100 text-[#0D7A57]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-emerald-100 text-[#0D7A57]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive('orderedList') ? 'bg-emerald-100 text-[#0D7A57]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Area Ketik Editor */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[250px] focus:outline-none"
      />
    </div>
  );
}