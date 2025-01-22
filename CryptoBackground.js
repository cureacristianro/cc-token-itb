import React from 'react';
import { Sun, Moon, Globe2, Star, Sparkles, Orbit, Atom } from 'lucide-react';

// SVG components for crypto logos
const EthereumLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg">
    <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fill="currentColor" fillOpacity="0.4"/>
    <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="currentColor" fillOpacity="0.3"/>
    <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fill="currentColor" fillOpacity="0.4"/>
    <path d="M127.962 416.905v-104.72L0 236.585z" fill="currentColor" fillOpacity="0.3"/>
  </svg>
);

const SuiLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeOpacity="0.4"/>
    <path d="M30 40 L70 40 L70 60 L30 60 Z" fill="currentColor" fillOpacity="0.3"/>
  </svg>
);

const CryptoBackground = () => {
  const generateElements = (count) => {
    return Array(count).fill(null).map((_, index) => {
      // Increased probability of crypto logos appearing
      const icons = [
        EthereumLogo, EthereumLogo, EthereumLogo, // 3x ETH
        SuiLogo, SuiLogo, SuiLogo, // 3x SUI
        Globe2, Star, Sparkles, Orbit, Atom // Space elements
      ];
      const IconComponent = icons[Math.floor(Math.random() * icons.length)];
      const size = 30 + Math.random() * 50;
      const left = Math.random() * 100;
      const initialTop = Math.random() * 100;
      const duration = 15 + Math.random() * 20;
      const delay = index * -2; // Reduced delay for more movement
      
      return {
        IconComponent,
        style: {
          left: `${left}%`,
          top: `${initialTop}%`,
          width: size,
          height: size,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`
        }
      };
    });
  };

  const elements = generateElements(24); // Increased number of elements

return (
  <div className="fixed inset-0 overflow-hidden -z-10">
  <center>
  <h1 className="text-5xl font-extrabold text-white mb-4 mt-10">Blockchain Project</h1>
  <h2 className="text-3xl font-semibold text-gray-300 mt-5">Centralized Bridge Simulator</h2>
  </center>


    {/* Deep space gradient background (sau imagine de fundal) */}
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: 'url(src/crypto.jpeg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
      }} 
    />
  </div>
);

};

export default CryptoBackground;
