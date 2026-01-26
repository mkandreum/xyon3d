import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Box, Send, Database, Cloud, X, Loader2, Settings, Lock, LogOut, Search, Heart, User, ChevronRight, ChevronLeft, Hexagon, Info, ShieldCheck, Terminal, AlertTriangle, Cpu, Sparkles, ShoppingCart, ArrowRight, Package, TrendingUp, DollarSign, ShoppingBag, UploadCloud } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ViewState, Product, CartItem, AppSettings, Order } from './types';
import { ApiService } from './services/api';
import { generateProductDescription } from './services/gemini.ts';


// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

// 1. Product Card - Premium Minimalist
const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
  isLiked: boolean;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onClick: (p: Product) => void;
}> = ({ product, onAddToCart, isLiked, onToggleLike, onClick }) => (
  <div
    onClick={() => onClick(product)}
    className="group relative bg-zinc-900/40 rounded-3xl overflow-hidden transition-all duration-500 hover:bg-zinc-800/80 cursor-pointer border border-white/5 hover:border-white/10 flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5"
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
        className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors z-20 group/heart"
      >
        <Heart size={18} className={`${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white group-hover/heart:text-rose-400'} transition-colors`} />
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
        className="mt-auto w-full py-3 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm tracking-wide"
      >
        <Plus size={16} /> Add to Cart
      </button>
    </div>
  </div>
);

// 2. Product Detail Modal - Floating Sheet
const ProductDetailModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}> = ({ product, isOpen, onClose, onAddToCart }) => {
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

      <div className="relative w-full max-w-6xl h-[90vh] sm:h-auto sm:max-h-[85vh] bg-zinc-900 border border-white/10 rounded-[2rem] flex flex-col md:flex-row shadow-2xl overflow-hidden animate-scale-in ring-1 ring-white/5">
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-black/40 rounded-full text-white hover:bg-white/20 transition-colors border border-white/5 backdrop-blur-md">
          <X size={20} />
        </button>

        {/* Media Column */}
        <div className="w-full md:w-1/2 h-[45%] md:h-auto bg-black relative group">
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
              <Hexagon size={14} /> {show3D ? '2D Photo' : '3D View'}
            </button>
          )}
        </div>

        {/* Details Column */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto bg-zinc-900">
          <div className="mb-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {product.category}
              </span>
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">In Stock</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4 leading-tight">{product.name}</h2>
            <div className="text-3xl font-light text-white mb-8 border-b border-white/5 pb-8">${product.price.toFixed(2)}</div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-zinc-300 leading-relaxed font-light text-base">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Material</div>
                  <div className="text-sm font-semibold text-white">PLA+ / PETG</div>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Precision</div>
                  <div className="text-sm font-semibold text-white">0.12mm Layer</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { onAddToCart(product); onClose(); }}
            className="w-full py-4 mt-8 bg-white text-black rounded-2xl font-bold text-base hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-wide"
          >
            Add to Cart <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2.5 Auth Modal (Login/Register)
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void; onLoginSuccess: (user: any, token: string) => void }> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await ApiService.loginUser({ email, password });
        onLoginSuccess(data.user, data.token);
      } else {
        const data = await ApiService.register({ email, password, name });
        onLoginSuccess(data.user, data.token);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-heading font-bold text-white mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold ml-1">Name</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold ml-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 text-xs hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Checkout Component
// 5. Checkout Component (MONEI Hosted)
const CheckoutForm: React.FC<{ total: number, userEmail: string, items: CartItem[] }> = ({ total, userEmail, items }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMoneiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create Order (Pending)
      const order = await ApiService.createOrder({
        customerEmail: userEmail,
        items: items,
        total: total,
        status: 'pending',
        date: new Date().toISOString()
      });

      // 2. Create MONEI Payment
      const payment = await ApiService.createMoneiPayment({
        orderId: order.id,
        total: total,
        customerEmail: userEmail
      });

      // 3. Redirect to MONEI
      if (payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
      } else {
        throw new Error("No redirect URL received from payment gateway");
      }
    } catch (err: any) {
      console.error('Payment flow error:', err);
      setError(err.message || 'Payment process failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl text-center group transition-all hover:border-blue-500/30">
        <div className="mb-6 flex justify-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500">
            <Box size={24} />
          </div>
        </div>

        <p className="text-zinc-400 mb-6 text-sm">Secure payment via MONEI (Bizum, PayPal, Cards)</p>

        <div className="flex justify-center gap-3 mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tighter uppercase border border-white/5">Bizum</div>
          <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tighter uppercase border border-white/5">Visa/MC</div>
          <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tighter uppercase border border-white/5">PayPal</div>
        </div>

        <button
          onClick={handleMoneiPayment}
          disabled={loading}
          className={`
            w-full py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-xl 
            ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-100 hover:-translate-y-1 active:scale-95'}
          `}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Opening Gateway...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={20} className="text-blue-600" />
              <span className="uppercase tracking-widest text-sm">Pay ${total.toFixed(2)} Now</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-xs text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/20 animate-shake">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
        <Lock size={12} className="text-zinc-700" />
        <span>256-bit SSL Encrypted Connection</span>
      </div>
    </div>
  );
};

// 3. Auth Screen (Login / Register) - Unified
const AuthScreen: React.FC<{
  onLogin: (user: any, token: string) => void,
  isAdmin?: boolean
}> = ({ onLogin, isAdmin = false }) => {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For register
  const [code, setCode] = useState(''); // For 2FA
  const [show2FA, setShow2FA] = useState(false);

  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setErrorMsg('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body: any = { email, password };
      if (!isLogin) body.name = name;
      if (show2FA) body.code = code;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.require2fa) {
          setShow2FA(true);
          return;
        }
        setStatus('success');
        // Store session
        localStorage.setItem('xyon3d_token', data.token);
        localStorage.setItem('xyon3d_user', JSON.stringify(data.user));

        // Short delay for animation
        setTimeout(() => onLogin(data.user, data.token), 800);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Authentication failed');
        if (!show2FA) setPassword('');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg('Connection error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in-up p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white border border-white/5 shadow-xl rotate-3">
            <User size={28} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            {isAdmin ? 'Admin Portal' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="text-zinc-500 text-sm">
            {isAdmin ? 'Authorized personnel only.' : (isLogin ? 'Sign in to access your orders.' : 'Join Xyon3D today.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!show2FA ? (
            <>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <div className="animate-fade-in-up">
              <p className="text-zinc-400 text-xs mb-2 text-center">Enter Security Code (2FA)</p>
              <input
                type="text"
                placeholder="Security Code"
                className="w-full bg-zinc-900 border border-blue-500/50 rounded-xl p-4 text-white text-center tracking-[1em] font-mono focus:border-blue-500 outline-none transition-colors"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                required
              />
            </div>
          )}

          <button
            disabled={status === 'success'}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2
              ${status === 'success' ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}
            `}
          >
            {status === 'success' ? <ShieldCheck size={20} /> : (show2FA ? 'Verify Code' : (isLogin ? 'Sign In' : 'Sign Up'))}
          </button>

          {status === 'error' && (
            <div className="text-red-400 text-xs text-center mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {errorMsg}
            </div>
          )}
        </form>

        {!isAdmin && !show2FA && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Admin Panel - Modern Dashboard
const AdminPanel: React.FC<{
  settings: AppSettings;
  onSaveSettings: (s: AppSettings) => void;
  products: Product[];
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: 'pending' | 'shipped' | 'delivered') => void;
  onLogout: () => void;
}> = ({ settings, onSaveSettings, products, onAddProduct, onDeleteProduct, orders, onUpdateOrderStatus, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'system'>('products');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', price: 0, description: '', imageUrl: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=800', category: 'General', modelUrl: '', gallery: []
  });
  const [galleryText, setGalleryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleAiGenerate = async () => {
    if (!newProduct.name) return;
    setIsGenerating(true);
    const desc = await generateProductDescription(newProduct.name);
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await ApiService.uploadImage(e.target.files[0]);
        setNewProduct(prev => ({ ...prev, imageUrl: url }));
      } catch (err) {
        console.error('Upload failed:', err);
        alert('Failed to upload image');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div className="flex gap-2 p-1.5 bg-zinc-900 rounded-full border border-white/5 shadow-sm overflow-x-auto">
          {['products', 'orders', 'settings', 'system'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                ? 'bg-zinc-800 text-white shadow-md border border-white/5'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button onClick={onLogout} className="text-zinc-500 hover:text-rose-500 flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 transition-colors">
          <LogOut size={16} /> <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-3xl sticky top-24">
              <h2 className="text-lg font-heading font-bold mb-6 flex items-center gap-2 text-white">
                <Plus size={20} className="text-blue-500" /> Add Product
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none"
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  />
                  <input
                    type="text"
                    placeholder="Category"
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
                    placeholder="Description"
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
                    {isGenerating ? 'Thinking...' : 'AI Generate'}
                  </button>
                </div>

                {/* Image Upload UI */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Main Image URL"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none"
                      value={newProduct.imageUrl}
                      onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    />
                    <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white p-3.5 rounded-xl border border-white/10 transition-colors">
                      {isUploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  {newProduct.imageUrl && (
                    <div className="w-full h-32 bg-black rounded-xl overflow-hidden border border-white/5">
                      <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    </div>
                  )}
                </div>                <input
                  type="text"
                  placeholder="3D Model URL (.glb)"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none"
                  value={newProduct.modelUrl}
                  onChange={e => setNewProduct({ ...newProduct, modelUrl: e.target.value })}
                />
                <textarea
                  placeholder="Gallery URLs (Line Separated)"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-blue-500 outline-none h-20 resize-none"
                  value={galleryText}
                  onChange={e => setGalleryText(e.target.value)}
                />
                <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg">
                  Create Product
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {products.map(p => (
              <div key={p.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{p.name}</h4>
                    <p className="text-zinc-500 text-sm mt-0.5">${p.price} • {p.category}</p>
                  </div>
                </div>
                <button onClick={() => onDeleteProduct(p.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-rose-500 hover:text-white transition-all">
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
              <ShoppingBag size={20} className="text-blue-500" /> Order Management
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-white">Order #{order.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm mb-1">{order.customerEmail}</p>
                        <p className="text-zinc-500 text-xs">{new Date(order.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">${order.total.toFixed(2)}</div>
                          <div className="text-xs text-zinc-500">{order.items.length} item(s)</div>
                        </div>

                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                          className="bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
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
        <div className="glass-card p-10 rounded-3xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-8 text-white">System Configuration</h2>
          <div className="space-y-6">
            {Object.keys(localSettings).map((key) => (
              <div key={key}>
                <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2 font-semibold ml-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type={key.includes('Pass') || key.includes('ApiKey') ? 'password' : 'text'}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                  value={(localSettings as any)[key] || ''}
                  onChange={e => setLocalSettings({ ...localSettings, [key]: e.target.value })}
                  placeholder={key.includes('monei') ? 'YOUR_MONEI_KEY' : ''}
                />
              </div>
            ))}
            <button
              onClick={() => onSaveSettings(localSettings)}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-500 transition-colors mt-6 shadow-lg shadow-blue-900/20"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-5xl font-heading font-bold text-white mb-2">{orders.length}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total Orders Processed</span>
            </div>
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-5xl font-heading font-bold text-blue-500 mb-2">${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total Revenue</span>
            </div>
          </div>

          <div className="glass-card p-10 rounded-3xl">
            <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2 text-white">
              <Cloud size={24} className="text-blue-500" /> Deployment Configuration
            </h2>
            <div className="bg-black/80 p-6 rounded-2xl border border-white/10 font-mono text-xs text-zinc-400 overflow-x-auto relative">
              <div className="absolute top-0 right-0 p-2 text-[10px] text-zinc-600 uppercase">docker-compose.yml</div>
              <pre>{dockerComposeContent}</pre>
            </div>
            <p className="mt-4 text-zinc-500 text-sm">
              Copy this configuration to your Coolify instance to deploy the persistent database alongside the application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.STORE);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    storeName: 'Loading...', smtpHost: '', smtpUser: '', smtpPass: '', adminEmail: ''
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth & Admin Secret State
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Admin auth
  const [user, setUser] = useState<any>(null); // Customer auth
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [adminVisible, setAdminVisible] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load initial data from API

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Check for existing user session
        const token = localStorage.getItem('xyon3d_token');
        const savedUser = localStorage.getItem('xyon3d_user');
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }

        const [productsData, settingsData, ordersData, wishlistData] = await Promise.all([
          ApiService.getProducts(),
          ApiService.getSettings(),
          ApiService.getOrders(),
          ApiService.getWishlist(),
        ]);
        setProducts(productsData);
        setSettings(settingsData);
        setOrders(ordersData);
        setWishlist(wishlistData);
        setError(null);



      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


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

  const handleCheckout = async () => {
    if (!checkoutEmail || cart.length === 0) return;
    setCheckoutStatus('processing');

    try {
      const order = await ApiService.createOrder({
        items: cart,
        total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        date: new Date().toISOString(),
        customerEmail: checkoutEmail,
        status: 'pending'
      });

      setOrders(prev => [order, ...prev]);
      setCart([]);
      setCheckoutEmail('');
      setCheckoutStatus('success');
      setTimeout(() => setCheckoutStatus('idle'), 3000);
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please try again.');
      setCheckoutStatus('idle');
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      await ApiService.saveSettings(newSettings);
      setSettings(newSettings);
      alert("System Configuration Updated");
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    }
  };

  const handleAddProduct = async (p: Product) => {
    try {
      const savedProduct = await ApiService.saveProduct(p);
      setProducts(await ApiService.getProducts());
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await ApiService.deleteProduct(id);
      setProducts(await ApiService.getProducts());
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: 'pending' | 'shipped' | 'delivered') => {
    try {
      await ApiService.updateOrderStatus(id, status);
      setOrders(await ApiService.getOrders());
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading Xyon3D Store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Retry
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

        {/* Header - Transparent Sticky */}
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
              <span className="text-[9px] sm:text-[10px] text-blue-400 font-bold border border-blue-500/20 px-2 sm:px-3 py-1 bg-blue-500/5 rounded-full uppercase tracking-wider">Admin</span>
            )}
          </div>
        </header>

        <main className="flex-grow">

          {/* STORE VIEW */}
          {view === ViewState.STORE && (
            <div className="px-4 pb-20 pt-8 animate-fade-in-up">
              {/* Hero Section */}
              <div className="max-w-7xl mx-auto mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2">
                  <h1 className="text-5xl sm:text-7xl font-heading font-bold mb-6 text-white leading-[0.9]">
                    Engineer.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-white">Fabricate.</span>
                  </h1>
                  <p className="text-zinc-400 text-lg max-w-xl font-light leading-relaxed mb-8">
                    Industrial grade 3D parts and assets. Designed for precision, durability, and the future of manufacturing.
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
                    placeholder="Search catalog..."
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
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 max-w-7xl mx-auto">
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
                  <p className="text-zinc-500 font-sans">No products found matching your search.</p>
                </div>
              )}
            </div>
          )}

          {/* FAVORITES VIEW */}
          {view === ViewState.FAVORITES && (
            <div className="px-4 py-12 animate-fade-in-up max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-12">
                <Heart className="text-rose-500 fill-rose-500" size={32} />
                <h2 className="text-4xl font-heading font-bold text-white">Saved Items</h2>
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
                  Your wishlist is empty. Start exploring to save items.
                </div>
              )}
            </div>
          )}

          {/* PROFILE VIEW */}
          {view === ViewState.PROFILE && (
            !user ? (
              <AuthScreen onLogin={(userData, token) => {
                setUser(userData);
                // If user is admin (role check), set isAdmin. But for now general user login.
                if (userData.role === 'admin') setIsAuthenticated(true);
              }} />
            ) : (
              <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 animate-fade-in-up">
                <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden text-center group">
                  {/* Decorative Background */}
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black p-1 mb-6 relative shadow-2xl bg-zinc-900 flex items-center justify-center">
                      <User size={48} className="text-zinc-600" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">{user.name}</h2>
                    <p className="text-zinc-500 mb-6">{user.email}</p>

                    <div className="grid grid-cols-2 w-full gap-4 mb-8">
                      <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/5">
                        <div className="text-3xl font-heading font-bold text-white mb-1">
                          {orders.filter(o => o.customerEmail === user.email).length}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Orders</div>
                      </div>
                      <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/5">
                        <div className="text-3xl font-heading font-bold text-white mb-1">{wishlist.length}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Saved</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUser(null);
                        setIsAuthenticated(false);
                        localStorage.removeItem('xyon3d_token');
                        localStorage.removeItem('xyon3d_user');
                        setView(ViewState.STORE);
                      }}
                      className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-colors shadow-lg uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* CART VIEW */}
          {view === ViewState.CART && (
            <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in-up">
              <h2 className="text-4xl font-heading font-bold mb-12 text-white flex items-center gap-3">
                <ShoppingCart className="text-blue-500" /> Your Cart
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-24 bg-zinc-900/30 rounded-[2rem] border border-white/5 border-dashed">
                  <Package size={48} className="mx-auto mb-4 text-zinc-700" />
                  <p className="text-zinc-500">Your cart is currently empty.</p>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-grow space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex gap-6 items-center hover:bg-zinc-900 transition-colors">
                        <div className="w-24 h-24 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-white text-lg">{item.name}</h3>
                            <p className="text-white font-medium text-lg">${item.price.toFixed(2)}</p>
                          </div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">{item.category}</p>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-black rounded-lg p-1 border border-white/10">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white rounded-md transition-colors">-</button>
                              <span className="font-mono w-8 text-center text-white text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white rounded-md transition-colors">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="w-full lg:w-96">
                    <div className="glass-card p-8 rounded-3xl sticky top-24">
                      <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h3>
                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-zinc-400 text-sm">
                          <span>Subtotal</span>
                          <span>${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 text-sm">
                          <span>Shipping</span>
                          <span>Free</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                          <span>Total</span>
                          <span className="text-blue-400">${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {checkoutStatus === 'success' ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center animate-fade-in-up">
                          <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
                          <h3 className="text-white font-bold text-lg">Order Placed</h3>
                          <p className="text-zinc-400 text-xs mt-1">Confirmation email sent.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {!checkoutEmail ? ( // Simplified check
                            <>
                              <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none transition-colors text-sm"
                                value={checkoutEmail}
                                onChange={(e) => setCheckoutEmail(e.target.value)}
                              />
                              {/* Only show Payment button if email is entered (handled by rendering CheckoutForm below) */}
                            </>
                          ) : null}

                          {checkoutEmail && (
                            <CheckoutForm
                              total={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                              userEmail={checkoutEmail}
                              items={cart}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADMIN VIEW */}
          {view === ViewState.ADMIN && (
            isAuthenticated ? (
              <AdminPanel
                settings={settings}
                onSaveSettings={handleSaveSettings}
                products={products}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onLogout={() => { setIsAuthenticated(false); setView(ViewState.STORE); }}
              />
            ) : (
              <AuthScreen isAdmin={true} onLogin={(user, token) => {
                setUser(user);
                setIsAuthenticated(true);
              }} />
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

      {/* Floating Pill Navbar */}
      < Navbar
        currentView={view}
        setView={setView}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        isAuthenticated={isAuthenticated}
        isAdminVisible={adminVisible}
      />
    </div >
  );
}