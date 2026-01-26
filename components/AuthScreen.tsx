import React, { useState } from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
    onLogin: (user: any, token: string) => void;
    isAdmin?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, isAdmin = false }) => {
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
                setErrorMsg(data.error || 'Fallo en autenticación');
                if (!show2FA) setPassword('');
                setTimeout(() => setStatus('idle'), 2000);
            }
        } catch (error) {
            setStatus('error');
            setErrorMsg('Error de conexión');
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
                        {isAdmin ? 'Portal Admin' : (isLogin ? 'Bienvenido' : 'Crear Cuenta')}
                    </h2>
                    <p className="text-zinc-500 text-sm">
                        {isAdmin ? 'Solo personal autorizado.' : (isLogin ? 'Inicia sesión para ver tus pedidos.' : 'Únete a Xyon3D hoy.')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!show2FA ? (
                        <>
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Nombre Completo"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            )}
                            <input
                                type="email"
                                placeholder="Dirección de Email"
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </>
                    ) : (
                        <div className="animate-fade-in-up">
                            <p className="text-zinc-400 text-xs mb-2 text-center">Introduce Código de Seguridad (2FA)</p>
                            <input
                                type="text"
                                placeholder="Código de Seguridad"
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
                        {status === 'success' ? <ShieldCheck size={20} /> : (show2FA ? 'Verificar Código' : (isLogin ? 'Iniciar Sesión' : 'Registrarse'))}
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
                            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
