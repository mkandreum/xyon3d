import React, { useState } from 'react';
import { Box, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { CartItem } from '../types';

interface CheckoutFormProps {
    total: number;
    userEmail: string;
    items: CartItem[];
    initialAddress?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ total, userEmail, items, initialAddress = '' }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [address, setAddress] = useState(initialAddress);

    const handleMoneiPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim()) {
            setError('La dirección de envío es obligatoria');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // 1. Create Order (Pending)
            const order = await ApiService.createOrder({
                customerEmail: userEmail,
                items: items,
                total: total,
                status: 'pending',
                date: new Date().toISOString(),
                shippingAddress: address
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
                throw new Error("No se recibió URL de redirección de la pasarela");
            }
        } catch (err: any) {
            console.error('Payment flow error:', err);
            setError(err.message || 'El proceso de pago falló. Por favor inténtalo de nuevo.');
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

                <p className="text-zinc-400 mb-6 text-sm">Pago seguro vía MONEI (Bizum, PayPal, Tarjetas)</p>

                {/* Address Input */}
                <div className="mb-6 text-left space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1">Dirección de Envío</label>
                    <textarea
                        required
                        placeholder="Calle, Número, Piso, Código Postal, Ciudad, País"
                        rows={3}
                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-blue-500 outline-none transition-colors resize-none"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

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
                            <span>Abriendo Pasarela...</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={20} className="text-blue-600" />
                            <span className="uppercase tracking-widest text-sm">Pagar ${total.toFixed(2)} Ahora</span>
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
                <span>Conexión Encriptada SSL 256-bit</span>
            </div>
        </div>
    );
};
