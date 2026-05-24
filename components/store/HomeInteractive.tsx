'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { clsx } from 'clsx';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  content: string;
  jersey: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Aravind Sharma',
    role: 'Football Fan',
    rating: 5,
    content: 'The quality of the Manchester United retro jersey is absolutely premium. The double-knit stitching and authentic fit is exactly what I was looking for. Will buy again!',
    jersey: 'Man United 1999 Retro',
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Fitness Enthusiast',
    rating: 5,
    content: 'Extremely lightweight and sweat-wicking. I wear it during my football training sessions and it holds up perfectly. Fast shipping too, got it in Bangalore within 2 days.',
    jersey: 'India National Football Jersey',
  },
  {
    id: 3,
    name: 'Kabir Mehta',
    role: 'Collector',
    rating: 5,
    content: 'Secure checkout and very fast delivery. I was skeptical about COD but it was seamless. The Real Madrid player edition fabric is elite quality.',
    jersey: 'Real Madrid 2024/25 Home',
  },
];

export const HomeInteractive: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const handlePrev = () => {
    setAutoplay(false);
    setActiveIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setAutoplay(false);
    setActiveIdx((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div className="space-y-16">
      
      {/* 1. Animated Stats Section */}
      <section className="border-y border-slate-100 dark:border-navy-900 bg-slate-50/50 dark:bg-navy-950/20 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-1.5"
            >
              <div className="text-3xl sm:text-4xl font-black font-heading text-navy-900 dark:text-white tracking-wide">
                15K+
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                Happy Customers
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-1.5"
            >
              <div className="text-3xl sm:text-4xl font-black font-heading text-navy-900 dark:text-white tracking-wide">
                99.4%
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                Satisfaction Rate
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-1.5"
            >
              <div className="text-3xl sm:text-4xl font-black font-heading text-navy-900 dark:text-white tracking-wide">
                24-48H
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                Express dispatch
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-1.5"
            >
              <div className="text-3xl sm:text-4xl font-black font-heading text-navy-900 dark:text-white tracking-wide">
                100%
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                Premium Fit Assured
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Customer Reviews Carousel */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            TESTIMONIALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-wide text-navy-900 dark:text-white uppercase">
            What the Fans Say
          </h2>
        </div>

        <div className="relative bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-900 rounded-2xl p-6 sm:p-10 shadow-sm transition-all duration-300">
          <Quote className="absolute top-6 left-6 h-8 w-8 text-slate-100 dark:text-navy-900 -z-0 pointer-events-none" />
          
          <div className="relative z-10 min-h-[160px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(testimonials[activeIdx].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-slate-650 dark:text-slate-350 leading-relaxed font-semibold italic">
                  "{testimonials[activeIdx].content}"
                </p>
                <div className="pt-2">
                  <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
                    {testimonials[activeIdx].name}
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase mt-0.5">
                    {testimonials[activeIdx].role} &middot; Verified Buyer of <span className="text-blue-600 dark:text-blue-400">{testimonials[activeIdx].jersey}</span>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider controls */}
            <div className="flex justify-end gap-2 mt-6 border-t border-slate-100 dark:border-navy-900 pt-4">
              <button
                onClick={handlePrev}
                className="p-2 border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-900 text-slate-600 dark:text-slate-400 rounded-full transition-colors"
                aria-label="Previous review"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-900 text-slate-600 dark:text-slate-400 rounded-full transition-colors"
                aria-label="Next review"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
