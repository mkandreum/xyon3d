import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { ApiService } from '../services/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
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
            setError(err.message || 'Fallo en la autenticación');
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
                    {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold ml-1">Nombre</label>
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
                        <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold ml-1">Contraseña</label>
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
                        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-zinc-500 text-xs hover:text-white transition-colors"
                    >
                        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                    </button>
                </div>
            </div>
        </div>
    );
};
