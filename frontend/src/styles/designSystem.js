// Next-Level Design System for AI Trip Planner

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary Colors
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Accent Colors
  accent: {
    orange: '#f97316',
    pink: '#ec4899',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    teal: '#14b8a6',
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const gradients = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600',
  primaryHover: 'hover:from-blue-700 hover:to-purple-700',
  secondary: 'bg-gradient-to-r from-purple-500 to-pink-500',
  accent: 'bg-gradient-to-r from-orange-400 to-pink-400',
  success: 'bg-gradient-to-r from-green-400 to-blue-500',
  warning: 'bg-gradient-to-r from-yellow-400 to-orange-500',

  // Enhanced animated backgrounds
  heroBackground: 'bg-gradient-to-br from-purple-900 via-blue-900 to-teal-800',
  heroBackgroundLight: 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50',
  cardGlass: 'bg-white/10 backdrop-blur-lg border border-white/20',
  cardGlassLight: 'bg-white/80 backdrop-blur-lg border border-white/30',

  // Animated gradients
  animated: 'bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-[length:200%_200%] animate-gradient-x',
  animatedHover: 'hover:bg-gradient-to-r hover:from-purple-700 hover:via-blue-700 hover:to-teal-700',
};

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  glow: 'shadow-lg shadow-blue-500/25',
  glowHover: 'hover:shadow-xl hover:shadow-blue-500/30',
};

export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  },
  bounce: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }
};

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
  '3xl': '6rem',
};

export const borderRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
};

export const typography = {
  heading: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-2xl md:text-3xl font-bold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-semibold',
    h6: 'text-base md:text-lg font-semibold',
  },
  body: {
    large: 'text-lg md:text-xl',
    base: 'text-base md:text-lg',
    small: 'text-sm md:text-base',
    xs: 'text-xs md:text-sm',
  }
};

export const components = {
  button: {
    primary: `${gradients.animated} text-white font-semibold py-4 px-8 ${borderRadius.xl} ${shadows.xl} hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1`,
    secondary: `${gradients.cardGlassLight} text-gray-700 font-semibold py-4 px-8 ${borderRadius.xl} ${shadows.lg} hover:shadow-xl hover:scale-105 transition-all duration-300`,
    outline: `border-2 border-white/30 text-white font-semibold py-4 px-8 ${borderRadius.xl} hover:bg-white/10 backdrop-blur-sm transition-all duration-300`,
    ghost: `text-gray-600 font-medium py-3 px-6 ${borderRadius.lg} hover:bg-gray-100/80 backdrop-blur-sm transition-all duration-200`,
    cta: `${gradients.animated} text-white font-bold py-5 px-10 ${borderRadius.xl} ${shadows.xl} hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 text-lg`,
  },
  card: {
    base: `${gradients.cardGlassLight} ${borderRadius.xl} ${shadows.lg} border border-white/30 backdrop-blur-lg`,
    hover: `${gradients.cardGlassLight} ${borderRadius.xl} ${shadows.lg} border border-white/30 backdrop-blur-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500`,
    interactive: `${gradients.cardGlassLight} ${borderRadius.xl} ${shadows.md} border border-white/30 backdrop-blur-lg hover:shadow-xl hover:scale-102 cursor-pointer transition-all duration-300`,
    glass: `${gradients.cardGlass} ${borderRadius.xl} ${shadows.lg} border border-white/20 backdrop-blur-xl`,
    glassHover: `${gradients.cardGlass} ${borderRadius.xl} ${shadows.lg} border border-white/20 backdrop-blur-xl hover:shadow-2xl hover:scale-105 hover:border-white/40 transition-all duration-500`,
  },
  input: {
    base: `w-full px-6 py-4 ${gradients.cardGlassLight} border border-white/30 ${borderRadius.xl} focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-lg transition-all duration-300 placeholder-gray-500`,
    large: `w-full px-8 py-5 ${gradients.cardGlassLight} border border-white/30 ${borderRadius.xl} focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-lg text-lg transition-all duration-300 placeholder-gray-500`,
    glass: `w-full px-6 py-4 ${gradients.cardGlass} border border-white/20 ${borderRadius.xl} focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-xl transition-all duration-300 placeholder-white/70 text-white`,
  }
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
};

// Utility functions
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getResponsiveClasses = (base, sm, md, lg, xl) => {
  return cn(
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`
  );
};

export default {
  colors,
  gradients,
  shadows,
  animations,
  spacing,
  borderRadius,
  typography,
  components,
  breakpoints,
  zIndex,
  cn,
  getResponsiveClasses,
};
