import React from 'react';

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-brand-dark via-[#3d0014] to-brand-primary flex flex-col items-center justify-center p-6 sm:p-8 overflow-hidden">
            <div className="w-full max-w-md mx-auto flex flex-col h-full relative z-10">
                {children}
            </div>

            {/* Background aesthetic elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[100px]" />
            </div>
        </div>
    );
};
