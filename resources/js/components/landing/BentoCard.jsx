import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const BentoCard = ({
  className,
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
  horizontal = false,
}) => {
  const cardRef = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const rectRef = useRef(null);
  const ticking = useRef(false);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e) => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (!rectRef.current) return;
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const rect = rectRef.current;
        if (!rect) { ticking.current = false; return; }
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = e.clientX - rect.left - cx;
        const dy = e.clientY - rect.top - cy;
        rotateY.set((dx / cx) * 5);
        rotateX.set(-(dy / cy) * 5);
        ticking.current = false;
      });
      ticking.current = true;
    }
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    ticking.current = false;
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={cn(
        "bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group hover:border-[#98e5dd]/30 transition-all duration-700 h-full",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#98e5dd]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className={cn(
        "relative z-10 h-full",
        horizontal ? "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center" : "flex flex-col gap-10"
      )}>
        <div className={cn(
          "space-y-8",
          horizontal ? "lg:col-span-4 text-center lg:text-left" : "col-span-full"
        )}>
          {Icon && (
            <div className="w-14 h-14 bg-[#98e5dd]/10 text-[#98e5dd] rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#98e5dd]/20 transition-all duration-700 shadow-2xl shadow-[#98e5dd]/10 mx-auto lg:mx-0">
              <Icon size={28} />
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter italic uppercase leading-[0.9]">
              {title}
            </h3>
            <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
              {description}
            </p>
          </div>
        </div>

        <div className={cn(
          "relative w-full",
          horizontal ? "lg:col-span-8 h-full flex flex-col justify-center" : "pt-4"
        )}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default BentoCard;
