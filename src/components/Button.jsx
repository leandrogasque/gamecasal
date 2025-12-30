import React from 'react';
import { cn } from '../utils/cn'; // Need to create utility

export const Button = ({ children, onClick, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-6 py-3 rounded-full font-serif text-lg font-medium transition-all duration-300 transform active:scale-95 shadow-md";

    const variants = {
        primary: "bg-brand-primary text-white hover:bg-brand-dark hover:shadow-lg hover:shadow-rose-900/50",
        secondary: "bg-white text-brand-primary border-2 border-brand-primary hover:bg-rose-50",
        outline: "border-2 border-white text-white hover:bg-white/10",
        ghost: "bg-transparent text-white/80 hover:text-white"
    };

    return (
        <button
            onClick={onClick}
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};
