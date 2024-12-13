import React, { useState, useEffect } from 'react';

const useDimensions = (ref: React.ReactElement) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial dimension setup
    handleResize();

    // Adding event listener for resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, [ref]); // Depend on ref to trigger update if it changes

  return dimensions;
};

export default useDimensions;