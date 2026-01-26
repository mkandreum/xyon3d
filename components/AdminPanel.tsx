import React, { useState } from 'react';
import { Plus, Trash2, ShoppingBag, Box, User, Cloud, DollarSign, ShieldCheck, Send, Loader2, UploadCloud, Sparkles, Package } from 'lucide-react';
import { AppSettings, Product, Order } from '../types';
import { ApiService } from '../services/api';
import { generateProductDescription } from '../services/gemini';

interface AdminPanelProps {
    settings: AppSettings;
    onSaveSettings: (s: AppSettings) => void;
    products: Product[];
    onAddProduct: (p: Product) => void;
    onDeleteProduct: (id: string) => void;
    orders: Order[];
    onUpdateOrderStatus: (id: string, status: 'pending' | 'shipped' | 'delivered') => void;
    onLogout: () => void;
    activeTab: 'products' | 'orders' | 'settings' | 'system';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    settings,
    onSaveSettings,
    products,
    onAddProduct,
    onDeleteProduct,
    orders,
    onUpdateOrderStatus,
    // onLogout, // Unused in this updated component structure, handled by parent
    activeTab
}) => {
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '', price: 0, description: '', imageUrl: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=800', category: 'General', modelUrl: '', gallery: []
    });
    const [galleryText, setGalleryText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [isUploading, setIsUploading] = useState(false);

    const handleAiGenerate = async () => {
        if (!newProduct.name) return;
        setIsGenerating(true);
        const desc = await generateProductDescription(newProduct.name);
        setNewProduct(prev => ({ ...prev, description: desc }));
        setIsGenerating(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'modelUrl') => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const url = await ApiService.uploadImage(e.target.files[0]);
                setNewProduct(prev => ({ ...prev, [field]: url }));
            } catch (err) {
                console.error('Upload failed:', err);
                alert('Fallo al subir archivo');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProduct.name && newProduct.price) {
            onAddProduct({
                id: Date.now().toString(),
                name: newProduct.name,
                price: Number(newProduct.price),
                description: newProduct.description || '',
                imageUrl: newProduct.imageUrl || '',
                categoryId: newProduct.category || 'General',
                // @ts-ignore
                category: newProduct.category || 'General',
                modelUrl: newProduct.modelUrl || '',
                gallery: galleryText.split('\n').filter(url => url.trim() !== ''),
                stock: newProduct.stock || 10
            });
            setNewProduct({ name: '', price: 0, description: '', imageUrl: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=800', category: 'General', modelUrl: '', gallery: [], stock: 10 });
            setGalleryText('');
        }
    };

    const dockerComposeContent = `version: '3.8'
services:
  app:
    build: .
    labels:
      - "coolify.managed=true"
      - "coolify.port=3000"
    environment:
      - DATABASE_URL=postgres://${localSettings.smtpUser}:${localSettings.smtpPass}@db:5432/xyon3d
    restart: always

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=securepassword
      - POSTGRES_DB=xyon3d
    restart: always

volumes:
  postgres_data:
`;

    return (
        <div className="max-w-7xl mx-auto pb-32 pt-6 px-4 sm:px-6 animate-fade-in-up">
            {/* Tab bar removed - now handled by Floating Navbar */}

            {activeTab === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-1">
                        <div className="glass-card p-6 rounded-3xl sticky top-24">
                            <h2 className="text-lg font-heading font-bold mb-6 flex items-center gap-2 text-white">
                                <Plus size={20} className="text-blue-500" /> Añadir Producto
                            </h2>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nombre del Producto"
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Precio"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none"
                                        value={newProduct.price || ''}
                                        onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Categoría"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none"
                                        value={newProduct.stock || ''}
                                        onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="relative">
                                    <textarea
                                        placeholder="Descripción"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none h-28 resize-none leading-relaxed"
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAiGenerate}
                                        disabled={!newProduct.name || isGenerating}
                                        className="absolute bottom-3 right-3 text-xs bg-zinc-800 text-blue-400 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1.5 font-medium disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles size={12} />}
                                        {isGenerating ? 'Pensando...' : 'Generar IA'}
                                    </button>
                                </div>

                                {/* Image Upload UI */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold ml-1">Imagen Principal</label>
                                    <div className="flex items-center gap-4">
                                        <label className={`flex-grow cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-white/10 border-dashed rounded-xl p-6 transition-all group ${newProduct.imageUrl ? 'border-blue-500/50 bg-blue-500/5' : ''}`}>
                                            <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 group-hover:text-white">
                                                {isUploading ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
                                                <span className="text-xs font-bold uppercase tracking-wide">
                                                    {newProduct.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen'}
                                                </span>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageUrl')} disabled={isUploading} />
                                        </label>

                                        {newProduct.imageUrl && (
                                            <div className="w-24 h-24 bg-black rounded-xl overflow-hidden border border-white/10 shrink-0">
                                                <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* 3D Model Upload UI */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold ml-1">Modelo 3D (.glb)</label>
                                    <div className="flex items-center gap-4">
                                        <label className={`w-full cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-white/10 border-dashed rounded-xl p-4 transition-all flex items-center justify-center gap-3 ${newProduct.modelUrl ? 'border-green-500/50 bg-green-500/5' : ''}`}>
                                            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Box size={20} className={newProduct.modelUrl ? 'text-green-500' : 'text-zinc-500'} />}
                                            <span className={`text-xs font-bold uppercase tracking-wide ${newProduct.modelUrl ? 'text-green-400' : 'text-zinc-400'}`}>
                                                {newProduct.modelUrl ? 'Modelo Cargado (Click para cambiar)' : 'Subir Archivo .GLB'}
                                            </span>
                                            <input type="file" className="hidden" accept=".glb,.gltf" onChange={(e) => handleFileUpload(e, 'modelUrl')} disabled={isUploading} />
                                        </label>
                                    </div>
                                </div>
                                <textarea
                                    placeholder="URLs Galería (Separadas por línea)"
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none h-20 resize-none"
                                    value={galleryText}
                                    onChange={e => setGalleryText(e.target.value)}
                                />
                                <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg">
                                    Crear Producto
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {products.map(p => (
                            <div key={p.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/20 transition-all group relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full">
                                    <div className="w-full sm:w-16 h-40 sm:h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/5">
                                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-white text-lg sm:text-base group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                        <p className="text-zinc-400 sm:text-zinc-500 text-sm mt-1 sm:mt-0.5 font-medium">${p.price} • <span className="text-zinc-500">{p.category}</span></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDeleteProduct(p.id)}
                                    className="absolute top-4 right-4 sm:static w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 sm:bg-zinc-800 text-white sm:text-zinc-400 hover:bg-rose-500 hover:text-white transition-all backdrop-blur-sm sm:backdrop-blur-none border border-white/10 sm:border-transparent"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <div className="glass-card p-6 rounded-3xl">
                        <h2 className="text-lg font-heading font-bold mb-6 flex items-center gap-2 text-white">
                            <ShoppingBag size={20} className="text-blue-500" /> Gestión de Pedidos
                        </h2>

                        {orders.length === 0 ? (
                            <div className="text-center py-16 text-zinc-500">
                                <Package size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No hay pedidos aún</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-zinc-900/80 border border-white/10 rounded-[2rem] p-5 sm:p-8 hover:border-white/20 transition-all group backdrop-blur-sm">
                                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                                            {/* Left Side: Order Info */}
                                            <div className="lg:w-1/3 space-y-5">
                                                <div className="flex items-center justify-between lg:justify-start gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors border border-white/5">
                                                            <Package size={22} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-xl">#{order.id}</h4>
                                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                                                {new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                                    <p className="text-sm font-medium text-zinc-300 flex items-center gap-2.5">
                                                        <User size={15} className="text-zinc-500 shrink-0" />
                                                        <span className="truncate">{order.customerEmail}</span>
                                                    </p>
                                                    {order.shippingAddress && (
                                                        <p className="text-xs text-zinc-500 flex items-start gap-2.5 leading-relaxed">
                                                            <Box size={15} className="text-zinc-600 mt-0.5 shrink-0" />
                                                            <span className="italic">{order.shippingAddress}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-full">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                                                            className={`w-full appearance-none bg-zinc-950 border rounded-xl px-5 py-3.5 text-xs font-bold uppercase tracking-widest outline-none transition-all cursor-pointer
                              ${order.status === 'delivered' ? 'text-green-400 border-green-500/20 hover:border-green-500/40' :
                                                                    order.status === 'shipped' ? 'text-blue-400 border-blue-500/20 hover:border-blue-500/40' : 'text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40'}
                            `}
                                                        >
                                                            <option value="pending">Pendiente</option>
                                                            <option value="shipped">Enviado</option>
                                                            <option value="delivered">Entregado</option>
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                            <Box size={14} className={
                                                                order.status === 'delivered' ? 'text-green-400' :
                                                                    order.status === 'shipped' ? 'text-blue-400' : 'text-yellow-400'
                                                            } />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side: Products Grid */}
                                            <div className="lg:w-2/3">
                                                <div className="bg-black/20 rounded-[1.5rem] border border-white/5 overflow-hidden flex flex-col h-full">
                                                    <div className="p-4 sm:p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                            <ShoppingBag size={14} /> Items
                                                        </span>
                                                        <span className="text-2xl font-heading font-black text-white tracking-tight">${order.total.toFixed(2)}</span>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 bg-zinc-800/30 p-3 sm:p-4 rounded-2xl border border-white/5 group/item transition-colors hover:bg-zinc-800/60">
                                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5">
                                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <h5 className="text-sm font-bold text-white group-hover/item:text-blue-400 transition-colors uppercase tracking-tight truncate">{item.name}</h5>
                                                                    <div className="flex items-center justify-between mt-1">
                                                                        <span className="text-xs text-zinc-500 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">x<span className="text-zinc-300 font-bold">{item.quantity}</span></span>
                                                                        <span className="text-xs font-bold text-white">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                        {/* Column 1: Store & Email */}
                        <div className="space-y-8">
                            {/* Store Identity */}
                            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5">
                                <h2 className="text-xl font-heading font-bold mb-6 text-white flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-blue-500" /> Identidad de la Tienda
                                </h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold ml-1">Nombre de la Tienda</label>
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                                            value={localSettings.storeName}
                                            onChange={e => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold ml-1">Email del Administrador</label>
                                        <input
                                            type="email"
                                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                                            value={localSettings.adminEmail}
                                            onChange={e => setLocalSettings({ ...localSettings, adminEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email / SMTP Service */}
                            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5">
                                <h2 className="text-xl font-heading font-bold mb-6 text-white flex items-center gap-2">
                                    <Send size={20} className="text-green-500" /> Servidor de Correo (SMTP)
                                </h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold ml-1">Host SMTP</label>
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                                            value={localSettings.smtpHost}
                                            onChange={e => setLocalSettings({ ...localSettings, smtpHost: e.target.value })}
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold ml-1">Usuario SMTP</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                                                value={localSettings.smtpUser}
                                                onChange={e => setLocalSettings({ ...localSettings, smtpUser: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold ml-1">Contraseña SMTP</label>
                                            <input
                                                type="password"
                                                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                                                value={localSettings.smtpPass}
                                                onChange={e => setLocalSettings({ ...localSettings, smtpPass: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Payment & Actions */}
                        <div className="space-y-8">
                            {/* MONEI / Payment Settings */}
                            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <DollarSign size={80} />
                                </div>

                                <h2 className="text-xl font-heading font-bold mb-6 text-white flex items-center gap-2 relative z-10">
                                    <ShieldCheck size={20} className="text-blue-400" /> Pasarela de Pago
                                </h2>
                                <p className="text-zinc-500 text-xs mb-8 relative z-10 px-1 border-l-2 border-blue-500 pl-3">
                                    Configura tus credenciales de <strong>MONEI</strong> para aceptar pagos seguros con Bizum, Tarjeta y PayPal.
                                </p>

                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <label className="text-[10px] text-blue-400 uppercase tracking-widest block mb-1 font-bold ml-1">MONEI Account ID</label>
                                        <input
                                            type="text"
                                            placeholder="u_..."
                                            className="w-full bg-zinc-950 border border-blue-500/30 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none transition-colors shadow-inner"
                                            value={localSettings.moneiAccountId || ''}
                                            onChange={e => setLocalSettings({ ...localSettings, moneiAccountId: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-blue-400 uppercase tracking-widest block mb-1 font-bold ml-1">MONEI API Key</label>
                                        <input
                                            type="password"
                                            placeholder="m_..."
                                            className="w-full bg-zinc-950 border border-blue-500/30 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none transition-colors shadow-inner"
                                            value={localSettings.moneiApiKey || ''}
                                            onChange={e => setLocalSettings({ ...localSettings, moneiApiKey: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-white/5">
                                    <button
                                        onClick={() => onSaveSettings(localSettings)}
                                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 hover:-translate-y-1 transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                    >
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Guardar Toda la Configuración
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {
                activeTab === 'system' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center">
                                <span className="text-5xl font-heading font-bold text-white mb-2">{orders.length}</span>
                                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total Pedidos Procesados</span>
                            </div>
                            <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center">
                                <span className="text-5xl font-heading font-bold text-blue-500 mb-2">${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</span>
                                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Ingresos Totales</span>
                            </div>
                        </div>

                        <div className="glass-card p-10 rounded-3xl">
                            <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2 text-white">
                                <Cloud size={24} className="text-blue-500" /> Configuración de Despliegue
                            </h2>
                            <div className="bg-black/80 p-6 rounded-2xl border border-white/10 font-mono text-xs text-zinc-400 overflow-x-auto relative">
                                <div className="absolute top-0 right-0 p-2 text-[10px] text-zinc-600 uppercase">docker-compose.yml</div>
                                <pre>{dockerComposeContent}</pre>
                            </div>
                            <p className="mt-4 text-zinc-500 text-sm">
                                Copia esta configuración a tu instancia de Coolify para desplegar la base de datos persistente junto con la aplicación.
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
