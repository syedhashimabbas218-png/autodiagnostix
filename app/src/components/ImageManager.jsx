import React, { useState, useEffect, useRef } from 'react';
import CMS_URL from '../config';

/**
 * Visual image manager for the admin dashboard.
 * Fully controlled component using `value` (array of strings) and `onChange`.
 */
export default function ImageManager({ value = [], onChange, maxImages = Infinity }) {
    const [library, setLibrary] = useState([]);
    const [showLibrary, setShowLibrary] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [librarySearch, setLibrarySearch] = useState('');
    const fileRef = useRef();

    // Load library lazily when opened
    useEffect(() => {
        if (!showLibrary) return;
        fetch(`${CMS_URL}/api/media?limit=100&depth=0`)
            .then(r => r.json())
            .then(data => {
                const docs = data.docs || data;
                setLibrary(docs.map(m => m.url || m.filename || m));
            })
            .catch(() => { });
    }, [showLibrary]);

    const removeImage = idx => {
        onChange(value.filter((_, i) => i !== idx));
    };

    const addFromLibrary = src => {
        if (value.includes(src)) return;
        if (value.length >= maxImages) {
            onChange([src]); // Replace if max reached (e.g. for single image mode)
        } else {
            onChange([...value, src]);
        }
    };

    const handleUpload = async e => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        const formData = new FormData();
        files.forEach(f => formData.append('file', f));
        try {
            const token = localStorage.getItem('payload-token');
            const res = await fetch(`${CMS_URL}/api/media`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            const data = await res.json();
            const uploadedUrl = data.doc?.url || data.url || data.filename || '';

            let newImages = uploadedUrl ? [...value, uploadedUrl] : value;
            if (newImages.length > maxImages) {
                newImages = newImages.slice(-maxImages);
            }
            onChange(newImages);

            // Refresh library
            const libRes = await fetch(`${CMS_URL}/api/media?limit=100&depth=0`);
            const libData = await libRes.json();
            const docs = libData.docs || libData;
            setLibrary(docs.map(m => m.url || m.filename || m));
            setShowLibrary(true);
        } catch {
            alert('Upload failed.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const filteredLibrary = library.filter(img =>
        img.toLowerCase().includes(librarySearch.toLowerCase())
    );

    return (
        <div className="space-y-3">
            {/* Current image thumbnails */}
            <div className="flex flex-wrap gap-3">
                {value.map((src, idx) => (
                    <div key={`${src}-${idx}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/20 bg-white shadow-sm">
                        <img
                            src={src}
                            alt=""
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                            ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[7px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {src.split('/').pop()}
                        </div>
                    </div>
                ))}

                {/* Add button */}
                {value.length < maxImages && (
                    <button
                        type="button"
                        onClick={() => setShowLibrary(s => !s)}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all text-xs gap-1"
                    >
                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Add</span>
                    </button>
                )}
            </div>

            {/* Upload from disk */}
            <div className="flex gap-2 items-center">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all ${uploading ? 'bg-surface-container text-on-surface-variant' : 'bg-primary text-white hover:scale-105'}`}>
                    <span className="material-symbols-outlined text-sm">{uploading ? 'hourglass_empty' : 'upload'}</span>
                    {uploading ? 'Uploading…' : 'Upload Image'}
                    <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
                <span className="text-[10px] text-on-surface-variant">or pick from library ↓</span>
            </div>

            {/* Image library picker */}
            {showLibrary && (
                <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container-lowest shadow-lg">
                    <div className="p-3 border-b border-outline-variant/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={librarySearch}
                            onChange={e => setLibrarySearch(e.target.value)}
                            className="flex-1 bg-transparent text-xs focus:outline-none"
                        />
                        <span className="text-[10px] text-on-surface-variant">{filteredLibrary.length} files</span>
                        <button type="button" onClick={() => setShowLibrary(false)} className="material-symbols-outlined text-sm text-on-surface-variant hover:text-on-surface">close</button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 p-3 max-h-56 overflow-y-auto custom-scrollbar">
                        {filteredLibrary.map(img => {
                            const selected = value.includes(img);
                            return (
                                <button
                                    key={img}
                                    type="button"
                                    onClick={() => selected ? removeImage(value.indexOf(img)) : addFromLibrary(img)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/40'}`}
                                    title={img.split('/').pop()}
                                >
                                    <img src={img} alt="" className="w-full h-full object-contain bg-white p-1 mix-blend-multiply" />
                                    {selected && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-lg bg-white rounded-full p-0.5">check_circle</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        {filteredLibrary.length === 0 && (
                            <div className="col-span-6 py-8 text-center text-xs text-on-surface-variant">No images found.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
