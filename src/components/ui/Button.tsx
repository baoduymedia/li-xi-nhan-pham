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
        primary: "bg-gradient-to-r from-[var(--tet-red-primary)] to-[var(--tet-red-dark)] text-[var(--tet-gold)] border border-[var(--tet-gold)] shadow-lg shadow-red-900/50 hover:brightness-110",
        secondary: "bg-[var(--tet-gold)] text-[var(--tet-red-dark)] hover:bg-[var(--tet-gold-light)] shadow-lg shadow-yellow-500/30 border border-transparent font-extrabold",
        outline: "bg-transparent text-[var(--tet-gold)] border-2 border-[var(--tet-gold)] hover:bg-[var(--tet-gold)]/10",
        ghost: "bg-transparent text-yellow-200/70 hover:text-yellow-100 hover:bg-white/5",
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
