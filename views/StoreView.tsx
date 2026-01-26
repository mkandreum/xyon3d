import React, { useMemo } from 'react';
import { Search, Package } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface StoreViewProps {
    products: Product[];
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedCategory: string;
    setSelectedCategory: (c: string) => void;
    addToCart: (p: Product, e?: React.MouseEvent) => void;
    wishlist: string[];
    toggleWishlist: (id: string, e: React.MouseEvent) => void;
    setSelectedProduct: (p: Product) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    addToCart,
    wishlist,
    toggleWishlist,
    setSelectedProduct
}) => {
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    return (
        <div className="px-4 pb-20 pt-8 animate-fade-in-up">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2">
                    <h1 className="text-5xl sm:text-7xl font-heading font-bold mb-6 text-white leading-[0.9]">
                        Diseña.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-white">Fabrica.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl font-light leading-relaxed mb-8">
                        Partes y activos 3D de grado industrial. Diseñados para precisión, durabilidad y el futuro de la manufactura.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto mb-12 space-y-8">
                {/* Search Bar */}
                <div className="relative group max-w-2xl">
                    <div className="absolute inset-0 bg-blue-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar en el catálogo..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:bg-zinc-800 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600 font-sans text-base shadow-sm group-hover:shadow-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2.5">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                ${selectedCategory === cat
                                    ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105'
                                    : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'}
              `}
                        >
                            {cat === 'All' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-6 lg:gap-8 max-w-7xl mx-auto">
                {filteredProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        isLiked={wishlist.includes(product.id)}
                        onToggleLike={toggleWishlist}
                        onClick={setSelectedProduct}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-32 opacity-50">
                    <Package size={48} className="mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500 font-sans">No se encontraron productos que coincidan con tu búsqueda.</p>
                </div>
            )}
        </div>
    );
};
