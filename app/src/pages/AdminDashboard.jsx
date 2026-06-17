import React, { useState, useEffect } from 'react';
import SeoHead from '../components/SeoHead';
import Header from '../components/Header';
import { Footer } from '../components/HomeComponents';
import GsapReveal from '../components/GsapReveal';
import ImageManager from '../components/ImageManager';
import { getProducts, getCategories } from '../payloadApi';
import CMS_URL from '../config';

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // Dynamic field states for Product
    const [features, setFeatures] = useState([]);
    const [specs, setSpecs] = useState([]);
    const [technicalTable, setTechnicalTable] = useState([]);
    const [heroImages, setHeroImages] = useState([]);

    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        if (editingItem && activeTab === 'products') {
            setFeatures(editingItem.features || []);
            setSpecs(editingItem.specs || []);
            setTechnicalTable(editingItem.technicalTable || []);
            setHeroImages(editingItem.heroImages || []);
        } else {
            setFeatures([]);
            setSpecs([]);
            setTechnicalTable([]);
            setHeroImages([]);
        }
    }, [editingItem, activeTab]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [pData, cData] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(pData);
            setCategories(cData);
        } catch (err) {
            console.error("Error refreshing data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type, id) => {
        try {
            const token = localStorage.getItem('payload-token');
            const res = await fetch(`${CMS_URL}/api/${type}/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok || res.status === 204) {
                setConfirmDeleteId(null);
                refreshData();
            } else {
                console.error("Delete failed with status:", res.status);
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const token = localStorage.getItem('payload-token');
                const res = await fetch(`${CMS_URL}/api/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    alert("Bulk upload successful!");
                    refreshData();
                } else {
                    alert("Bulk upload failed.");
                }
            } catch (err) {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const baseData = Object.fromEntries(formData.entries());

        let finalData = { ...baseData };

        if (activeTab === 'products') {
            finalData.heroImages = heroImages;
            finalData.features = features;
            finalData.specs = specs;
            finalData.technicalTable = technicalTable;
        }

        const method = editingItem ? 'PATCH' : 'POST';
        const url = editingItem
            ? `${CMS_URL}/api/${activeTab}/${editingItem.id}`
            : `${CMS_URL}/api/${activeTab}`;

        try {
            const token = localStorage.getItem('payload-token');
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(finalData)
            });
            if (res.ok) {
                setShowModal(false);
                setEditingItem(null);
                refreshData();
            }
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const filteredItems = (activeTab === 'products' ? products : categories).filter(item =>
        (item.name || item.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helpers for dynamic fields
    const addFeature = () => setFeatures([...features, { title: '', description: '', image: '' }]);
    const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index));
    const updateFeature = (index, field, value) => {
        const newFeatures = [...features];
        newFeatures[index][field] = value;
        setFeatures(newFeatures);
    };

    const addTech = () => setTechnicalTable([...technicalTable, { label: '', value: '' }]);
    const removeTech = (index) => setTechnicalTable(technicalTable.filter((_, i) => i !== index));
    const updateTech = (index, field, value) => {
        const newTech = [...technicalTable];
        newTech[index][field] = value;
        setTechnicalTable(newTech);
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <SeoHead title="Admin Dashboard" noindex />
            <Header />
            <main className="pt-32 pb-20 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <a href="/" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Website
                                </a>
                            </div>
                            <h1 className="text-4xl font-aeonik font-extrabold tracking-tighter mb-2">Management Dashboard</h1>
                            <p className="text-on-surface-variant">Update, add, or remove products and categories.</p>
                        </div>
                        <div className="flex gap-4">
                            <label className="bg-surface-container-high text-on-surface px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest shadow-sm hover:bg-surface-container-highest transition-all cursor-pointer">
                                Bulk JSON
                                <input type="file" accept=".json" onChange={handleBulkUpload} className="hidden" />
                            </label>
                            <button
                                onClick={() => { setEditingItem(null); setShowModal(true); }}
                                className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                            >
                                Add {activeTab === 'products' ? 'Product' : 'Category'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 border-b border-outline-variant/20 mb-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Products ({products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Categories ({categories.length})
                        </button>
                        <div className="ml-auto mb-4 relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-surface-container-low border border-outline-variant/20 rounded-full px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-xl font-aeonik">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredItems.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 flex items-center justify-between hover:shadow-md transition-all group">
                                    <a
                                        href={`/product/${item.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-6 group/link flex-1 min-w-0"
                                        title="Open product page"
                                    >
                                        <div className="w-14 h-14 bg-white rounded-lg p-2 border border-outline-variant/10 flex items-center justify-center flex-shrink-0">
                                            <img src={(item.heroImages ? item.heroImages[0] : item.image) || '/placeholder.png'} alt="" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold group-hover/link:text-primary transition-colors flex items-center gap-1.5">
                                                {item.name}
                                                <span className="material-symbols-outlined text-[14px] opacity-0 group-hover/link:opacity-60 transition-opacity">open_in_new</span>
                                            </h3>
                                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest truncate">{item.id}</p>
                                        </div>
                                    </a>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingItem(item); setShowModal(true); }}
                                            className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        {confirmDeleteId === item.id ? (
                                            <div className="flex items-center gap-2 bg-red-50 rounded-full px-3 py-1">
                                                <span className="text-xs font-bold text-red-700">Sure?</span>
                                                <button
                                                    onClick={() => handleDelete(activeTab, item.id)}
                                                    className="text-xs font-black text-red-600 hover:underline"
                                                >Yes</button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="text-xs font-black text-on-surface-variant hover:underline"
                                                >No</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDeleteId(item.id)}
                                                className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all text-red-500"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <GsapReveal direction="up" duration={0.3} className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-y-auto shadow-2xl custom-scrollbar relative">
                        <div className="sticky top-0 bg-surface/80 backdrop-blur-md px-10 py-6 border-b border-outline-variant/10 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-extrabold tracking-tight">
                                {editingItem ? 'Edit' : 'Add'} {activeTab === 'products' ? 'Product' : 'Category'}
                            </h2>
                            <button type="button" onClick={() => setShowModal(false)} className="material-symbols-outlined bg-surface-container-high p-2 rounded-full hover:bg-error/10 hover:text-error transition-all">close</button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Basic Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">ID (Slug)</label>
                                            <input name="id" defaultValue={editingItem?.id} required disabled={!!editingItem} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</label>
                                            <input name="name" defaultValue={editingItem?.name} required className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                        </div>
                                    </div>

                                    {activeTab === 'products' ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Brand</label>
                                                    <input name="brand" defaultValue={editingItem?.brand} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
                                                    <select name="category" defaultValue={editingItem?.category} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all">
                                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Summary (Short)</label>
                                                <input name="summary" defaultValue={editingItem?.summary} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Hero Images</label>
                                                <ImageManager key={editingItem ? editingItem.id : 'new'} value={heroImages} onChange={setHeroImages} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Badge</label>
                                                <select name="badge" defaultValue={editingItem?.badge} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all">
                                                    <option value="">None</option>
                                                    <option value="NEW">NEW</option>
                                                    <option value="DISCONTINUED">DISCONTINUED</option>
                                                    <option value="TRENDING">TRENDING</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Description</label>
                                                <textarea name="description" defaultValue={editingItem?.description} rows={4} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all resize-none" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tagline</label>
                                                <input name="tagline" defaultValue={editingItem?.tagline} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Image URL</label>
                                                <input name="image" defaultValue={editingItem?.image} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Description</label>
                                                <textarea name="description" defaultValue={editingItem?.description} rows={3} className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all resize-none" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {activeTab === 'products' && (
                                    <div className="space-y-8 pl-8 border-l border-outline-variant/10">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Features</h3>
                                                <button type="button" onClick={addFeature} className="text-xs font-bold text-primary hover:underline">+ Add</button>
                                            </div>
                                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                                {features.map((f, i) => (
                                                    <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 space-y-2 relative group-item">
                                                        <button type="button" onClick={() => removeFeature(i)} className="absolute top-2 right-2 text-red-500 material-symbols-outlined text-sm">delete</button>
                                                        <input placeholder="Feature Title" value={f.title} onChange={e => updateFeature(i, 'title', e.target.value)} className="bg-transparent border-b border-outline-variant/20 w-full text-xs font-bold py-1 focus:outline-none" />
                                                        <textarea placeholder="Description" value={f.description} onChange={e => updateFeature(i, 'description', e.target.value)} className="bg-transparent w-full text-[10px] focus:outline-none resize-none" rows={2} />
                                                        <div className="pt-2">
                                                            <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Feature Image</label>
                                                            <ImageManager
                                                                value={f.image ? [f.image] : []}
                                                                onChange={imgs => updateFeature(i, 'image', imgs[0] || '')}
                                                                maxImages={1}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Technical Table</h3>
                                                <button type="button" onClick={addTech} className="text-xs font-bold text-primary hover:underline">+ Add</button>
                                            </div>
                                            <div className="space-y-2">
                                                {technicalTable.map((t, i) => (
                                                    <div key={i} className="flex gap-2 items-center">
                                                        <input placeholder="Label" value={t.label} onChange={e => updateTech(i, 'label', e.target.value)} className="bg-surface-container-low border border-outline-variant/10 rounded p-2 text-[10px] w-1/3" />
                                                        <input placeholder="Value" value={t.value} onChange={e => updateTech(i, 'value', e.target.value)} className="bg-surface-container-low border border-outline-variant/10 rounded p-2 text-[10px] flex-grow" />
                                                        <button type="button" onClick={() => removeTech(i)} className="text-red-500 material-symbols-outlined text-xs">close</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                                {editingItem ? 'Update Database' : 'Create Entry'}
                            </button>
                        </form>
                    </GsapReveal>
                </div>
            )}

            <Footer />
        </div>
    );
}
