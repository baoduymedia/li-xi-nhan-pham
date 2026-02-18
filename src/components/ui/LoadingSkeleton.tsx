import { twMerge } from 'tailwind-merge';

interface LoadingSkeletonProps {
    className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div
            className={twMerge(
                "animate-pulse bg-white/10 rounded-xl",
                className
            )}
        />
    );
}

export function EnvelopeSkeleton() {
    return (
        <div className="w-full max-w-sm aspect-[3/4] mx-auto relative perspective-container">
            <div className="w-full h-full bg-red-900/30 rounded-lg border-2 border-yellow-500/20 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
                <div className="w-3/4 h-8 bg-white/10 rounded animate-pulse" />
            </div>
        </div>
    );
}
