import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';


interface ButtonProps extends Omit<HTMLMotionProps<"button">, "className"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    className?: string; // Add back className as optional string
}

const Button = ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 border border-transparent",
        secondary: "bg-yellow-400 text-red-900 hover:bg-yellow-300 shadow-lg shadow-yellow-400/30 border border-transparent",
        outline: "bg-transparent text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40",
        ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
    };

    const sizes = {
        sm: "text-sm px-4 py-2",
        md: "text-base px-6 py-3",
        lg: "text-lg px-8 py-4",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
