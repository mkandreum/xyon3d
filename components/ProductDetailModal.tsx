import React, { useState, useEffect, useMemo } from 'react';
import { X, Hexagon, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    product,
    isOpen,
    onClose,
    onAddToCart
}) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [show3D, setShow3D] = useState(false);

    const images = useMemo(() => {
        return product.gallery && product.gallery.length > 0
            ? [product.imageUrl, ...product.gallery.filter(url => url !== product.imageUrl)]
            : [product.imageUrl];
    }, [product]);

    useEffect(() => {
        if (!isOpen || show3D || images.length <= 1) return;
        const interval = setInterval(() => {
            setActiveImageIndex(prev => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isOpen, show3D, images.length]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in-up" onClick={onClose} />

            <div className="relative w-full max-w-6xl h-[90dvh] sm:h-auto sm:max-h-[85vh] bg-zinc-900 border border-white/10 rounded-[2rem] flex flex-col md:flex-row shadow-2xl overflow-hidden animate-scale-in ring-1 ring-white/5">
                <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-black/40 rounded-full text-white hover:bg-white/20 transition-colors border border-white/5 backdrop-blur-md">
                    <X size={20} />
                </button>

                {/* Media Column - Mobile: Fixed aspect ratio or flexible height / Desktop: Auto width */}
                <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-black relative group flex-shrink-0">
                    {show3D && product.modelUrl ? (
                        // @ts-ignore
                        <model-viewer
                            src={product.modelUrl}
                            camera-controls
                            auto-rotate
                            shadow-intensity="1"
                            style={{ width: '100%', height: '100%', backgroundColor: '#050505' }}
                            camera-orbit="45deg 55deg 2.5m"
                        />
                    ) : (
                        <img
                            src={images[activeImageIndex]}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-90"
                        />
                    )}

                    {/* Image Navigation Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setActiveImageIndex(idx); setShow3D(false); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${!show3D && idx === activeImageIndex ? 'bg-white w-8' : 'bg-white/20 w-1.5 hover:bg-white/40'}`}
                            />
                        ))}
                        {product.modelUrl && (
                            <button
                                onClick={() => setShow3D(true)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${show3D ? 'bg-blue-500 w-8' : 'bg-white/20 w-1.5 hover:bg-white/40'}`}
                            />
                        )}
                    </div>

                    {product.modelUrl && (
                        <button
                            onClick={() => setShow3D(!show3D)}
                            className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-2"
                        >
                            <Hexagon size={14} /> {show3D ? 'Foto 2D' : 'Vista 3D'}
                        </button>
                    )}
                </div>

                {/* Details Column - Mobile: Fills remaining space / Desktop: 1/2 width */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col flex-1 overflow-y-auto bg-zinc-900">
                    <div className="mb-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {product.category}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">En Stock</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">{product.name}</h2>
                        <div className="text-2xl sm:text-3xl font-light text-white mb-8 border-b border-white/5 pb-8">${product.price.toFixed(2)}</div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Descripción</h3>
                                <p className="text-zinc-300 leading-relaxed font-light text-sm sm:text-base">
                                    {product.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Material</div>
                                    <div className="text-sm font-semibold text-white">PLA+ / PETG</div>
                                </div>
                                <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Precisión</div>
                                    <div className="text-sm font-semibold text-white">Capa 0.12mm</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { onAddToCart(product); onClose(); }}
                        className="w-full py-4 mt-8 bg-white text-black rounded-2xl font-bold text-base hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-wide flex-shrink-0"
                    >
                        Añadir al Carrito <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
