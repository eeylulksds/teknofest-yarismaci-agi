import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NotFoundProps {
    onGoHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome }) => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center transition-colors">
            <div className="w-24 h-24 rounded-3xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shadow-inner">
                <AlertTriangle className="w-12 h-12" />
            </div>

            <h1 className="text-6xl sm:text-8xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
                404
            </h1>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Aradığınız Sayfa Bulunamadı
            </h2>

            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                Buraya gelmek için yanlış bir yol seçmiş olabilirsiniz. Endişelenmeyin, ana sayfaya dönüp maceranıza kaldığınız yerden devam edebilirsiniz.
            </p>

            <button
                onClick={onGoHome}
                className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
                Ana Sayfaya Dön
            </button>
        </div>
    );
};