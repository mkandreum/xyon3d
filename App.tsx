import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertTriangle, Hexagon, LogOut, Heart } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ViewState, Product, CartItem, AppSettings, Order } from './types';
import { ApiService } from './services/api';

// Components
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AuthScreen } from './components/AuthScreen';
import { AdminPanel } from './components/AdminPanel';

// Views
import { StoreView } from './views/StoreView';
import { CartView } from './views/CartView';
import { ProfileView } from './views/ProfileView';
import { NotificationBanner, NotificationType } from './components/NotificationBanner';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.STORE);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    storeName: 'Cargando...', smtpHost: '', smtpUser: '', smtpPass: '', adminEmail: '',
    moneiAccountId: '', moneiApiKey: ''
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);
  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
  };

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Auth & Admin Secret State
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Admin auth
  const [user, setUser] = useState<any>(null); // Customer auth
  // const [showAuthModal, setShowAuthModal] = useState(false); // Removed unused

  const [adminVisible, setAdminVisible] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeAdminTab, setActiveAdminTab] = useState<'products' | 'orders' | 'settings' | 'system'>('products');
  // const [checkoutEmail, setCheckoutEmail] = useState(''); // Moved to CartView
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Data Fetching
  const refreshData = async () => {
    try {
      // Check for user session
      const token = localStorage.getItem('xyon3d_token');
      const savedUser = localStorage.getItem('xyon3d_user');
      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'admin') setIsAuthenticated(true);
      }

      // Fetch products (Critical)
      try {
        const productsData = await ApiService.getProducts();
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Fallo al cargar productos. Por favor verifica tu conexión.');
        setLoading(false);
        return;
      }

      // Fetch other data (Non-critical, handle 401s)
      const safeFetch = async (fetchFn: () => Promise<any>, setter: (data: any) => void) => {
        try {
          const data = await fetchFn();
          setter(data);
        } catch (err: any) {
          if (err.message !== 'Unauthorized') {
            console.warn('Non-critical fetch failed:', err);
          } else {
            setter([]); // Reset if unauthorized (e.g. on logout)
          }
        }
      };

      await Promise.all([
        safeFetch(ApiService.getSettings, setSettings),
        safeFetch(ApiService.getOrders, setOrders),
        safeFetch(ApiService.getWishlist, setWishlist),
      ]);

      setError(null);
    } catch (err) {
      console.error('Initial load error:', err);
      setError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogin = (userData: any, token: string) => {
    localStorage.setItem('xyon3d_token', token);
    localStorage.setItem('xyon3d_user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'admin') {
      setIsAuthenticated(true);
      setView(ViewState.ADMIN);
    }
    refreshData(); // Refresh protected data like orders/wishlist
  };

  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  const toggleWishlist = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const isLiked = wishlist.includes(id);
      if (isLiked) {
        await ApiService.removeFromWishlist(id);
        setWishlist(prev => prev.filter(item => item !== id));
      } else {
        await ApiService.addToWishlist(id);
        setWishlist(prev => [...prev, id]);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const addToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotification(`Añadido al carrito: ${product.name}`, 'success');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      await ApiService.saveSettings(newSettings);
      setSettings(newSettings);
      showNotification("Configuración del Sistema Actualizada", 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      showNotification('Fallo al guardar la configuración', 'error');
    }
  };

  const handleAddProduct = async (p: Product) => {
    try {
      await ApiService.saveProduct(p);
      setProducts(await ApiService.getProducts());
      showNotification('Producto creado correctamente', 'success');
    } catch (err) {
      console.error('Error adding product:', err);
      showNotification('Fallo al añadir producto', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await ApiService.deleteProduct(id);
      setProducts(await ApiService.getProducts());
      showNotification('Producto eliminado', 'info');
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('Fallo al eliminar producto', 'error');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: 'pending' | 'shipped' | 'delivered') => {
    try {
      await ApiService.updateOrderStatus(id, status);
      setOrders(await ApiService.getOrders());
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Fallo al actualizar estado del pedido');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Cargando Tienda Xyon3D...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error de Conexión</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-white pb-32 overflow-x-hidden">
      {/* Premium Tech Background */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>

      <div className="relative z-10 w-full min-h-screen flex flex-col">

        {/* Header - Transparent Sticky (Only shown if NOT in Admin Authenticated mode) */}
        {!(view === ViewState.ADMIN && isAuthenticated) && (
          <header className="px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center sticky top-0 z-40 transition-all duration-300 backdrop-blur-md bg-black/40 border-b border-white/5">
            <button onClick={() => setLogoClicks(p => p + 1)} className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-white select-none focus:outline-none flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-black flex items-center justify-center rounded-lg">
                <Hexagon size={16} className="sm:w-[18px] sm:h-[18px]" fill="black" />
              </div>
              <span className="hidden sm:inline">{settings.storeName || 'Xyon3D'}</span>
              <span className="sm:hidden">Xyon3D</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated && (
                <button
                  onClick={() => setView(ViewState.ADMIN)}
                  className="text-[9px] sm:text-[10px] text-blue-400 font-bold border border-blue-500/20 px-2 sm:px-3 py-1 bg-blue-500/5 rounded-full uppercase tracking-wider hover:bg-blue-500/10 transition-colors"
                >
                  Admin
                </button>
              )}
            </div>
          </header>
        )}

        <main className="flex-grow">

          <NotificationBanner
            isVisible={!!notification}
            message={notification?.message || ''}
            type={notification?.type || 'info'}
            onClose={() => setNotification(null)}
          />

          {/* STORE VIEW */}
          {view === ViewState.STORE && (
            <div className="animate-fade-in-up w-full">
              <StoreView
                products={products}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                addToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                setSelectedProduct={setSelectedProduct}
              />
            </div>
          )}

          {/* FAVORITES VIEW */}
          {view === ViewState.FAVORITES && (
            !user ? (
              <AuthScreen onLogin={handleLogin} />
            ) : (
              <div className="px-4 py-12 animate-fade-in-up max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-12">
                  <Heart className="text-rose-500 fill-rose-500" size={32} />
                  <h2 className="text-4xl font-heading font-bold text-white">Artículos Guardados</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {wishlistProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      isLiked={true}
                      onToggleLike={toggleWishlist}
                      onClick={setSelectedProduct}
                    />
                  ))}
                </div>
                {wishlistProducts.length === 0 && (
                  <div className="text-center py-32 text-zinc-500 font-light">
                    Tu lista de deseos está vacía. Comienza a explorar para guardar artículos.
                  </div>
                )}
              </div>
            )
          )}

          {/* PROFILE VIEW */}
          {view === ViewState.PROFILE && (
            !user ? (
              <div className="animate-fade-in-up w-full"><AuthScreen onLogin={handleLogin} /></div>
            ) : (
              <div className="animate-fade-in-up w-full">
                <ProfileView
                  user={user}
                  orders={orders}
                  wishlist={wishlist}
                  setUser={setUser}
                  setIsAuthenticated={setIsAuthenticated}
                  setCart={setCart}
                  setView={setView}
                />
              </div>
            )
          )}

          {/* CART VIEW */}
          {view === ViewState.CART && (
            <div className="animate-fade-in-up w-full">
              <CartView
                cart={cart}
                user={user}
                updateQuantity={updateQuantity}
                checkoutStatus={checkoutStatus}
              />
            </div>
          )}

          {/* ADMIN VIEW */}
          {view === ViewState.ADMIN && (
            isAuthenticated ? (
              <div className="min-h-screen bg-black animate-fade-in">
                {/* Custom Minimal Header for Admin */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-950/50 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                      <Hexagon size={18} fill="white" />
                    </div>
                    <h1 className="text-xl font-heading font-bold text-white tracking-tight">Panel de Control</h1>
                  </div>
                  <button
                    onClick={() => {
                      setUser(null);
                      setIsAuthenticated(false);
                      localStorage.removeItem('xyon3d_token');
                      localStorage.removeItem('xyon3d_user');
                      setView(ViewState.STORE);
                    }}
                    className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </div>

                <div className="pb-40">
                  <AdminPanel
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                    products={products}
                    onAddProduct={handleAddProduct}
                    onDeleteProduct={handleDeleteProduct}
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onLogout={() => { setIsAuthenticated(false); setView(ViewState.STORE); }}
                    activeTab={activeAdminTab}
                  />
                </div>
              </div>
            ) : (
              <AuthScreen isAdmin={true} onLogin={handleLogin} />
            )
          )}

        </main>

        {/* Product Modal */}
        {
          selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              isOpen={!!selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={(p) => addToCart(p)}
            />
          )
        }
      </div >

      <Navbar
        currentView={view}
        setView={setView}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        isAuthenticated={isAuthenticated}
        isAdminVisible={adminVisible}
        activeAdminTab={activeAdminTab}
        onAdminTabChange={setActiveAdminTab}
      />
    </div >
  );
}
