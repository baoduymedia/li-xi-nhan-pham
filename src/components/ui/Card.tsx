import { type HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '../../lib/utils';


interface CardProps extends Omit<HTMLMotionProps<"div">, "className"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const Card = ({ children, className, hoverEffect = false, ...props }: CardProps) => {
    return (
        <motion.div
            className={cn(
                "glass-panel rounded-2xl p-6 relative overflow-hidden",
                hoverEffect && "hover:bg-red-900/60 transition-colors duration-300",
                className
            )}
            {...props}
        >
            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-500 fill-current">
                    <path d="M0 0 H100 V100 Z" />
                </svg>
            </div>
            {children}
        </motion.div>
    );
};

export default Card;
