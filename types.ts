export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  gallery?: string[]; // Array of image URLs
  modelUrl?: string; // URL to .glb/.gltf file
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AppSettings {
  storeName: string;
  smtpHost: string;
  smtpUser: string;
  smtpPass: string; // Stored locally for demo purposes
  adminEmail: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  customerEmail: string;
  status: 'pending' | 'shipped' | 'delivered';
}

export enum ViewState {
  STORE = 'store',
  FAVORITES = 'favorites',
  CART = 'cart',
  PROFILE = 'profile',
  ADMIN = 'admin',
}