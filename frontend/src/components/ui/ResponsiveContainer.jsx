import React from 'react';
import { motion } from 'framer-motion';

const ResponsiveContainer = ({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = 'px-4 sm:px-6 lg:px-8',
  animate = true,
  ...props 
}) => {
  const containerClasses = `
    max-w-${maxWidth} mx-auto ${padding} ${className}
  `.trim();

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={containerClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
