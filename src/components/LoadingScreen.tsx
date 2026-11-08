import React from 'react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">

            {/* Dönen Halka ve Roket */}
            <div className="relative w-24 h-24 mb-6">
                {/* Arka plandaki soluk halka */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>

                {/* Dönen renkli halka */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin"></div>

                {/* Ortadaki Roket */}
                <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
                    🚀
                </div>
            </div>

            {/* Yazı */}
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                TEKNOFEST Yarışmacı Ağı
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-mono">
                Yükleniyor...
            </p>
        </div>
    );
};