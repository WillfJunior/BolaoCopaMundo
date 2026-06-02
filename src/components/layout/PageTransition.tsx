import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}
