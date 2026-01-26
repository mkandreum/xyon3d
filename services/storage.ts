import { Product, AppSettings, Order } from '../types';

// Initial Seed Data with Real 3D Models (using Khronos samples for demo) and Galleries
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Voron StealthBurner',
    description: 'High-temp ABS faceplate for Voron 3D printers. Optimized airflow design with integrated LED mounts.',
    price: 24.99,
    category: 'Parts',
    imageUrl: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1631541909061-71e349d1f203?q=80&w=1000',
      'https://images.unsplash.com/photo-1615858079603-2415d3159082?q=80&w=1000'
    ],
    modelUrl: 'https://models.readyplayer.me/64f02638843c0807b585358c.glb' // Placeholder avatar as complex part
  },
  {
    id: '2',
    name: 'Articulated Dragon',
    description: 'Print-in-place flexible dragon. PLA Silk finish. Perfect desk toy with over 40 articulated joints.',
    price: 15.50,
    category: 'Toys',
    imageUrl: 'https://images.unsplash.com/photo-1615858079603-2415d3159082?q=80&w=800&auto=format&fit=crop',
    gallery: [
       'https://images.unsplash.com/photo-1615858079603-2415d3159082?q=80&w=800',
       'https://images.unsplash.com/photo-1596496181963-c40d6c54780b?q=80&w=800'
    ],
    modelUrl: 'https://storage.googleapis.com/mikes-public-assets/Dragon.glb' // Public google asset
  },
  {
    id: '3',
    name: 'Geometric Planter',
    description: 'Minimalist low-poly planter for succulents. Water drainage included. Printed in Matte PLA.',
    price: 12.00,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800',
      'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=800'
    ],
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' // Standard astronaut test model
  },
  {
    id: '4',
    name: 'Cyberpunk Helmet',
    description: 'Full scale wearable helmet prop. Raw print, ready for sanding and painting.',
    price: 85.00,
    category: 'Cosplay',
    imageUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=800',
      'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=800'
    ],
    modelUrl: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb' // Robot model
  }
];

const INITIAL_SETTINGS: AppSettings = {
  storeName: 'PolyForm 3D',
  smtpHost: 'smtp.gmail.com',
  smtpUser: 'admin@polyform.com',
  smtpPass: '',
  adminEmail: 'admin@polyform.com'
};

// Key constants
const K_PRODUCTS = 'polyform_products';
const K_SETTINGS = 'polyform_settings';
const K_ORDERS = 'polyform_orders';
const K_WISHLIST = 'polyform_wishlist';

export const StorageService = {
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(K_PRODUCTS);
    if (!stored) {
      localStorage.setItem(K_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  },

  saveProduct: (product: Product) => {
    const products = StorageService.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(K_PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string) => {
    const products = StorageService.getProducts();
    const newProducts = products.filter(p => p.id !== id);
    localStorage.setItem(K_PRODUCTS, JSON.stringify(newProducts));
  },

  getSettings: (): AppSettings => {
    const stored = localStorage.getItem(K_SETTINGS);
    if (!stored) {
      localStorage.setItem(K_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(stored);
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(K_SETTINGS, JSON.stringify(settings));
  },

  getOrders: (): Order[] => {
    const stored = localStorage.getItem(K_ORDERS);
    return stored ? JSON.parse(stored) : [];
  },

  createOrder: (order: Order) => {
    const orders = StorageService.getOrders();
    orders.unshift(order);
    localStorage.setItem(K_ORDERS, JSON.stringify(orders));
  },

  getWishlist: (): string[] => {
    const stored = localStorage.getItem(K_WISHLIST);
    return stored ? JSON.parse(stored) : [];
  },

  saveWishlist: (ids: string[]) => {
    localStorage.setItem(K_WISHLIST, JSON.stringify(ids));
  }
};