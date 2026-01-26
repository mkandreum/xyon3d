import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onAddToCart: (p: Product, e: React.MouseEvent) => void;
    isLiked: boolean;
    onToggleLike: (id: string, e: React.MouseEvent) => void;
    onClick: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    isLiked,
    onToggleLike,
    onClick
}) => (
    <div
        onClick={() => onClick(product)}
        className="group relative bg-zinc-900/40 rounded-3xl overflow-hidden transition-all duration-500 hover:bg-zinc-800/80 cursor-pointer border border-white/5 hover:border-white/10 flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1"
    >
        {/* Image Container */}
        <div className="aspect-square w-full overflow-hidden relative bg-black">
            <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />

            <button
                onClick={(e) => onToggleLike(product.id, e)}
                className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors z-20 group/heart active:scale-95"
            >
                <Heart size={18} className={`${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white group-hover/heart:text-rose-400'} transition-all duration-300 ${isLiked ? 'scale-110' : 'scale-100'}`} />
            </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 block">
                        {product.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-white leading-tight group-hover:text-blue-200 transition-colors">{product.name}</h3>
                </div>
                <span className="font-sans text-white font-medium text-lg tracking-tight">${product.price.toFixed(2)}</span>
            </div>

            <p className="text-zinc-500 text-sm line-clamp-2 mb-4 font-light leading-relaxed">{product.description}</p>

            <button
                onClick={(e) => onAddToCart(product, e)}
                className="mt-auto w-full py-3 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm tracking-wide shadow-lg hover:shadow-xl hover:shadow-white/5"
            >
                <Plus size={16} /> Añadir al Carrito
            </button>
        </div>
    </div>
);
