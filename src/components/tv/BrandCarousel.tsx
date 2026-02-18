import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandCarouselProps {
    autoPlayInterval?: number;
}

const BrandCarousel = ({ autoPlayInterval = 5000 }: BrandCarouselProps) => {
    const slides = [
        {
            type: 'portfolio',
            title: 'Bảo Duy Media',
            description: 'Professional Content Creation',
            image: '/branding/bdm-hero.jpg', // Placeholder
            color: 'from-blue-900 to-purple-900'
        },
        {
            type: 'auraart',
            title: 'AuraArt Studio',
            description: 'AI-Powered Portrait Generation',
            image: '/branding/auraart-sample.jpg', // Placeholder
            color: 'from-pink-900 to-red-900'
        },
        {
            type: 'testimonial',
            title: 'Client Testimonial',
            description: '"Ứng dụng quá đỉnh! Bọn em chơi cả đêm 🔥"',
            author: '- Khách hàng hài lòng',
            color: 'from-yellow-900 to-orange-900'
        }
    ];

    const [currentSlide, setCurrentSlide] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);
        return () => clearInterval(timer);
    }, [autoPlayInterval]);

    const slide = slides[currentSlide];

    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-br ${slide.color} flex flex-col items-center justify-center p-8 text-center`}
                >
                    {slide.image && (
                        <div className="w-full h-48 bg-white/10 rounded-xl mb-6 flex items-center justify-center backdrop-blur-sm">
                            {/* Placeholder for image */}
                            <div className="text-6xl">🎬</div>
                        </div>
                    )}

                    <h2 className="text-3xl font-bold text-white mb-2">{slide.title}</h2>
                    <p className="text-xl text-white/80 mb-4">{slide.description}</p>

                    {slide.author && (
                        <p className="text-sm text-white/60 italic">{slide.author}</p>
                    )}

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 flex gap-2">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default BrandCarousel;
