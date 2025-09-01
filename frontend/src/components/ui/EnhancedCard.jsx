import React from 'react';
import { motion } from 'framer-motion';

const EnhancedCard = ({
  children,
  className = '',
  hover = true,
  padding = 'lg',
  shadow = 'xl',
  rounded = '2xl',
  backdrop = true,
  border = true,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  };

  const baseClasses = `
    ${backdrop ? 'bg-white/90 backdrop-blur-lg' : 'bg-white'}
    ${border ? 'border border-white/20' : ''}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${paddingClasses[padding]}
    transition-all duration-300
    ${className}
  `.trim();

  const hoverClasses = hover ? 'hover:shadow-2xl hover:-translate-y-1' : '';

  const cardClasses = `${baseClasses} ${hoverClasses}`;

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default EnhancedCard;
