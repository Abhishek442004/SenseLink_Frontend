// src/pages/Preloader.jsx
import React, { useEffect, useState } from 'react';
import '../styles/Preloader.css'; 

const TARGET_TEXT = 'SenseLink - AI Powered IoT';

export default function Preloader() {
  const [displayText, setDisplayText] = useState('');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        TARGET_TEXT
          .split('')
          .map((char, i) => {
            if (i < iterations) return TARGET_TEXT[i];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      iterations += 1;
      if (iterations > TARGET_TEXT.length) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="preloader-container">
      <h1 className="decrypt-text">{displayText}</h1>
    </div>
  );
}
