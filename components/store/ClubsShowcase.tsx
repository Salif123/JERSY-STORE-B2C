'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface Club {
  id: string;
  name: string;
  category: string;
  tagline: string;
  accentColor: string; // Tailwind accent or hex glow color
  glowColor: string; // Shadow glow color
  banner: string; // Background photo from Unsplash
  logo: string; // Team SVG Logo or icon placeholder path
  jerseyUrl: string; // Product link
  textColor: string;
}

const clubs: Club[] = [
  {
    id: 'real-madrid',
    name: 'Real Madrid',
    category: 'football',
    tagline: 'Hala Madrid y nada más',
    accentColor: '#F1B82D',
    glowColor: 'rgba(241, 184, 45, 0.45)',
    banner: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    logo: 'M',
    textColor: 'text-amber-400',
    jerseyUrl: '/products?search=Madrid',
  },
  {
    id: 'manchester-united',
    name: 'Manchester United',
    category: 'football',
    tagline: 'Glory Glory Man United',
    accentColor: '#DA291C',
    glowColor: 'rgba(218, 41, 28, 0.45)',
    banner: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    logo: 'MU',
    textColor: 'text-red-500',
    jerseyUrl: '/products?search=Manchester',
  },
  {
    id: 'csk',
    name: 'Chennai Super Kings',
    category: 'cricket',
    tagline: 'Whistle Podu for the Kings',
    accentColor: '#F2D100',
    glowColor: 'rgba(242, 209, 0, 0.45)',
    banner: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    logo: 'CSK',
    textColor: 'text-yellow-400',
    jerseyUrl: '/products?search=Chennai',
  },
  {
    id: 'mumbai-indians',
    name: 'Mumbai Indians',
    category: 'cricket',
    tagline: 'Duniya Hila Denge Hum',
    accentColor: '#004BA0',
    glowColor: 'rgba(0, 75, 160, 0.45)',
    banner: 'https://images.unsplash.com/photo-1540747737956-3787257e91cd?auto=format&fit=crop&w=800&q=80',
    logo: 'MI',
    textColor: 'text-blue-500',
    jerseyUrl: '/products?search=Mumbai',
  },
  {
    id: 'lakers',
    name: 'LA Lakers',
    category: 'basketball',
    tagline: 'Showtime gold and purple legacy',
    accentColor: '#552583',
    glowColor: 'rgba(85, 37, 131, 0.45)',
    banner: 'https://images.unsplash.com/photo-1504450758481-7338eaa75e6a?auto=format&fit=crop&w=800&q=80',
    logo: 'LAL',
    textColor: 'text-purple-400',
    jerseyUrl: '/products?search=Lakers',
  },
];

// SVG Marquee Items
const marqueeItems = [
  { name: 'Nike', icon: 'M12 17.5c-2.3 0-5.8-2.6-7.8-4.7L3.5 12c4 0 7.8 2.2 9.8 3.5 2.2 1.5 5 1.5 5 1.5s-2.8-1-6.3-1z' },
  { name: 'Adidas', icon: 'M4 17h3l3-6H7zm5 0h3l3-9h-3zm5 0h3l3-12h-3z' },
  { name: 'Puma', icon: 'M18 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 3c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z' },
  { name: 'LaLiga', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z' },
  { name: 'Premier League', icon: 'M12 4l-8 4v8l8 4 8-4v-8z' },
  { name: 'IPL', icon: 'M8 6h8v2H8zm0 4h8v2H8zm0 4h8v2H8z' },
  { name: 'NBA', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' }
];

export const ClubsShowcase: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDraggable, setIsDraggable] = useState(false);

  // Auto-scroll carousel slowly
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDraggable) {
        setActiveIdx((prev) => (prev + 1) % clubs.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isDraggable]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + clubs.length) % clubs.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % clubs.length);
  };

  return (
    <section className="relative w-full py-20 bg-slate-950 dark:bg-navy-950 text-white overflow-hidden border-y border-slate-900 transition-colors duration-300">
      
      {/* 1. Cinematic Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Spotlights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[130px] animate-float-reverse" />
        
        {/* Subtle Mesh Grid Overlays */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* 2. Header Section */}
        <div className="text-center md:text-left md:flex md:justify-between md:items-end border-b border-slate-900 pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/60 border border-blue-900/40 px-3 py-1 rounded-full">
              <Sparkles className="h-3 w-3 text-blue-400 animate-spin" />
              Official Collections
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading text-white tracking-wider uppercase">
              Shop by Club & Franchise
            </h2>
            <p className="text-xs text-slate-400 max-w-md font-semibold">
              Wear the official crests of premium leagues, football giants, and cricket powerhouses.
            </p>
          </div>

          {/* Controls */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handlePrev}
              className="h-10 w-10 flex items-center justify-center border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-full transition-all duration-200 active:scale-95 shadow-lg"
              aria-label="Previous club"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="h-10 w-10 flex items-center justify-center border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-full transition-all duration-200 active:scale-95 shadow-lg"
              aria-label="Next club"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 3. Horizontal Infinite Marquee Row */}
        <div className="relative w-full overflow-hidden py-4 border-y border-slate-900/60 bg-slate-950/20 backdrop-blur-sm">
          <div className="flex gap-16 animate-marquee whitespace-nowrap items-center select-none">
            {/* First Set */}
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-slate-500 hover:text-blue-400 transition-colors duration-250 cursor-pointer">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
                <span className="font-heading text-lg tracking-widest uppercase">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Clubs Carousel Viewport */}
        <div className="relative w-full">
          {/* Snap scrolling horizontal container optimized for mobile and desktop */}
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory"
            onMouseEnter={() => setIsDraggable(true)}
            onMouseLeave={() => setIsDraggable(false)}
          >
            {clubs.map((club, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={club.id}
                  className={clsx(
                    "flex-shrink-0 w-[290px] sm:w-[350px] snap-center transition-all duration-500",
                    isActive ? "scale-100 opacity-100" : "scale-[0.96] opacity-75 md:opacity-60"
                  )}
                >
                  <ClubCard club={club} />
                </div>
              );
            })}
          </div>

          {/* Active dot indicators */}
          <div className="flex justify-center gap-1.5 mt-8">
            {clubs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-350",
                  activeIdx === idx ? "w-8 bg-blue-500" : "w-2.5 bg-slate-800 hover:bg-slate-700"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

// 3D Tilt Club Card Component
interface ClubCardProps {
  club: Club;
}

const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Parallax / Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to avoid jittery movements
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-150, 150], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-150, 150], [-10, 10]), springConfig);
  
  // Highlight glow movements
  const glowX = useSpring(useTransform(x, [-150, 150], ['30%', '70%']), springConfig);
  const glowY = useSpring(useTransform(y, [-150, 150], ['30%', '70%']), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Coordinates relative to card center
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative h-[420px] w-full rounded-2xl bg-slate-900 border border-slate-850 overflow-hidden cursor-pointer transition-all duration-300 hover:border-slate-700 shadow-xl"
    >
      
      {/* Outer Shadow Glow on Hover */}
      <div 
        style={{
          boxShadow: `0 0 45px -10px ${club.accentColor}`,
        }}
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none rounded-2xl"
      />

      {/* Image zoom effect */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-950">
        <Image
          src={club.banner}
          alt={`${club.name} banner`}
          fill
          className="object-cover opacity-35 group-hover:opacity-50 group-hover:scale-108 transition-all duration-700 ease-out"
          sizes="(max-width: 640px) 290px, 350px"
        />
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
        <div 
          style={{
            background: `radial-gradient(circle at ${glowX.get()} ${glowY.get()}, ${club.accentColor}22 0%, transparent 60%)`,
          }}
          className="absolute inset-0 z-15 pointer-events-none"
        />
      </div>

      {/* Card Content Layout */}
      <div className="relative h-full w-full p-6 flex flex-col justify-between z-20" style={{ transform: 'translateZ(30px)' }}>
        
        {/* Category Badge & Parallax Team Logo */}
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-md">
            {club.category}
          </span>
          
          {/* Logo Badge (Rotate on Hover) */}
          <div 
            style={{ 
              borderColor: club.accentColor,
              boxShadow: `0 0 12px ${club.glowColor}`,
            }}
            className="h-10 w-10 border bg-slate-950/90 rounded-xl flex items-center justify-center font-heading text-sm font-black tracking-widest text-white rotate-0 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300"
          >
            {club.logo}
          </div>
        </div>

        {/* Bottom Metadata & Tagline Reveal */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-heading text-white uppercase tracking-wider">
              {club.name}
            </h3>
            {/* Tagline */}
            <p className="text-xs font-semibold text-slate-400 line-clamp-1 group-hover:text-slate-200 transition-colors duration-200">
              {club.tagline}
            </p>
          </div>

          {/* Expandable CTA button area on hover */}
          <div className="overflow-hidden h-0 group-hover:h-12 transition-all duration-300 ease-out">
            <Link 
              href={club.jerseyUrl}
              className="inline-flex w-full items-center justify-center gap-2 border bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:text-white dark:hover:text-slate-950 hover:bg-blue-600 dark:hover:bg-white text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-md"
              style={{
                borderColor: club.accentColor,
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Collection
            </Link>
          </div>
        </div>

      </div>

    </motion.div>
  );
};
