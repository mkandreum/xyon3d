import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationBannerProps {
    message: string;
    type?: NotificationType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 4000
}) => {
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsRendering(true);
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        } else {
            // Allow exit animation
            const timer = setTimeout(() => setIsRendering(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isRendering && !isVisible) return null;

    const bgColors = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    };

    const icons = {
        success: CheckCircle,
        error: AlertTriangle,
        warning: AlertTriangle,
        info: Info
    };

    const Icon = icons[type];
    const colorClass = bgColors[type];

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <div className={`pointer-events-auto backdrop-blur-xl border rounded-2xl p-4 shadow-2xl flex items-start gap-3 ${colorClass}`}>
                <Icon size={20} className="mt-0.5 shrink-0" />
                <div className="flex-grow text-sm font-medium leading-relaxed font-sans">
                    {message}
                </div>
                <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity p-0.5">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
