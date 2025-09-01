import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResponsiveGrid = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'gap-6',
  className = '',
  animate = true,
  stagger = 0.1,
  ...props 
}) => {
  const gridClasses = `
    grid 
    grid-cols-${columns.sm} 
    md:grid-cols-${columns.md} 
    lg:grid-cols-${columns.lg}
    ${gap} 
    ${className}
  `.trim();

  if (animate) {
    return (
      <div className={gridClasses} {...props}>
        <AnimatePresence>
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.5, 
                delay: index * stagger,
                ease: "easeOut"
              }}
            >
              {child}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
