import React, { useState, useEffect, useRef } from "react";

const AnimatedNumber = ({ value, suffix = "", duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const observerRef = useRef(null);
  const startTime = useRef(null);
  const targetValue = value;
  const isFloat = !Number.isInteger(value);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTime.current = null;
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observerRef.current.observe(countRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [value]);

  const animate = (timestamp) => {
    if (!startTime.current) startTime.current = timestamp;
    const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1);
    
    const currentCount = progress * targetValue;
    
    if (countRef.current) {
      countRef.current.textContent = isFloat 
        ? currentCount.toFixed(1) + suffix
        : Math.floor(currentCount).toLocaleString() + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  return <span ref={countRef}>0{suffix}</span>;
};

export default AnimatedNumber;
