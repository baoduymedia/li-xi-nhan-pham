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
                "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl",
                hoverEffect && "hover:bg-white/10 transition-colors duration-300",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
