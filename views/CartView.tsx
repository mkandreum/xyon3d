import React, { useState } from 'react';
import { ShoppingCart, Package, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { CheckoutForm } from '../components/CheckoutForm';

interface CartViewProps {
    cart: CartItem[];
    user: any;
    updateQuantity: (id: string, delta: number) => void;
    checkoutStatus: 'idle' | 'processing' | 'success';
}

export const CartView: React.FC<CartViewProps> = ({
    cart,
    user,
    updateQuantity,
    checkoutStatus
}) => {
    const [checkoutEmail, setCheckoutEmail] = useState('');

    return (
        <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in-up">
            <h2 className="text-4xl font-heading font-bold mb-12 text-white flex items-center gap-3">
                <ShoppingCart className="text-blue-500" /> Tu Carrito
            </h2>

            {cart.length === 0 ? (
                <div className="text-center py-24 bg-zinc-900/30 rounded-[2rem] border border-white/5 border-dashed">
                    <Package size={48} className="mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-500">Tu carrito está vacío.</p>
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
                        <div className="glass-card p-6 sm:p-8 rounded-3xl sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Resumen de Pedido</h3>
                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-zinc-400 text-sm">
                                    <span>Subtotal</span>
                                    <span>${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400 text-sm">
                                    <span>Envío</span>
                                    <span>Gratis</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                                    <span>Total</span>
                                    <span className="text-blue-400">${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {checkoutStatus === 'success' ? (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center animate-fade-in-up">
                                    <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
                                    <h3 className="text-white font-bold text-lg">Pedido Realizado</h3>
                                    <p className="text-zinc-400 text-xs mt-1">Email de confirmación enviado.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Only show email input if user is NOT logged in AND hasn't entered an email yet */}
                                    {!user && !checkoutEmail && (
                                        <>
                                            <input
                                                type="email"
                                                placeholder="Email para compra como invitado"
                                                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none transition-colors text-sm"
                                                value={checkoutEmail}
                                                onChange={(e) => setCheckoutEmail(e.target.value)}
                                            />
                                        </>
                                    )}

                                    {(user || checkoutEmail) && (
                                        <CheckoutForm
                                            total={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                                            userEmail={user ? user.email : checkoutEmail}
                                            items={cart}
                                            initialAddress={user?.address}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
