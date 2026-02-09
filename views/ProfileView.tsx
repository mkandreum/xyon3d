import React from 'react';
import { User, LogOut } from 'lucide-react';
import { ApiService } from '../services/api';
import { CartItem, ViewState, Order } from '../types';

interface ProfileViewProps {
    user: any;
    orders: Order[];
    wishlist: string[];
    setUser: (u: any | null) => void;
    setIsAuthenticated: (b: boolean) => void;
    setCart: (c: CartItem[]) => void;
    setView: (v: ViewState) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
    user,
    orders,
    wishlist,
    setUser,
    setIsAuthenticated,
    setCart,
    setView
}) => {
    return (
        <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 lg:py-20 animate-fade-in-up">
            <div className="glass-card p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden text-center group">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-blue-600/10 to-transparent"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full border-4 border-black p-1 mb-4 sm:mb-6 relative shadow-2xl bg-zinc-900 flex items-center justify-center">
                        <User size={36} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-zinc-600" />
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-white mb-1 sm:mb-2">{user.name}</h2>
                    <p className="text-zinc-500 text-sm sm:text-base mb-4 sm:mb-6">{user.email}</p>

                    <div className="grid grid-cols-2 w-full gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-zinc-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/5">
                            <div className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">
                                {orders.filter(o => o.customerEmail === user.email).length}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Pedidos</div>
                        </div>
                        <div className="bg-zinc-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/5">
                            <div className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">{wishlist.length}</div>
                            <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Guardados</div>
                        </div>
                    </div>

                    <div className="w-full text-left bg-zinc-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5 mb-6 sm:mb-8">
                        <label className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 mb-2 sm:mb-3 block">Dirección de Envío Guardada</label>
                        <textarea
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white text-xs sm:text-sm focus:border-blue-500 outline-none transition-colors resize-none disabled:opacity-50"
                            rows={3}
                            placeholder="No hay dirección guardada aún."
                            value={user.address || ''}
                            onChange={async (e) => {
                                const newAddress = e.target.value;
                                setUser({ ...user, address: newAddress });
                            }}
                        />
                        <button
                            onClick={async () => {
                                try {
                                    const updatedUser = await ApiService.updateProfile({ name: user.name, address: user.address });
                                    setUser(updatedUser);
                                    localStorage.setItem('xyon3d_user', JSON.stringify(updatedUser));
                                    alert('Perfil actualizado correctamente!');
                                } catch (err) {
                                    alert('Fallo al actualizar perfil');
                                }
                            }}
                            className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:text-blue-300 transition-colors"
                        >
                            Guardar Dirección
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setUser(null);
                            setIsAuthenticated(false);
                            setCart([]); // Clear cart on sign out
                            localStorage.removeItem('xyon3d_token');
                            localStorage.removeItem('xyon3d_user');
                            setView(ViewState.STORE);
                        }}
                        className="w-full py-3 sm:py-4 bg-white text-black rounded-xl sm:rounded-2xl font-bold hover:bg-zinc-200 transition-colors shadow-lg uppercase tracking-wide text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                        <LogOut size={14} className="sm:w-4 sm:h-4" /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};
