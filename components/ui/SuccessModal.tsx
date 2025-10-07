'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = 'Success',
  message = 'Your submission has been completed successfully!'
}: SuccessModalProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Trigger checkmark animation
      setTimeout(() => setShowCheckmark(true), 100);
      
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'][Math.floor(Math.random() * 8)]
      }));
      setConfettiPieces(pieces);
    } else {
      setShowCheckmark(false);
      setConfettiPieces([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2 h-2 animate-confetti"
              style={{
                left: `${piece.left}%`,
                top: '-10px',
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center relative z-10">
          {/* Checkmark Circle */}
          <div className="relative w-32 h-32 mb-6">
            {/* Circle */}
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="3"
                className={showCheckmark ? 'animate-draw-circle' : 'opacity-0'}
              />
            </svg>
            
            {/* Checkmark */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <path
                d="M 30 50 L 45 65 L 70 35"
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={showCheckmark ? 'animate-draw-check' : 'opacity-0'}
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8">
            {message}
          </p>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#4ECDC4] hover:bg-[#45b8b0] text-white font-medium rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes draw-circle {
          from {
            stroke-dasharray: 0 283;
            opacity: 1;
          }
          to {
            stroke-dasharray: 283 283;
            opacity: 1;
          }
        }

        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
            opacity: 1;
          }
          100% {
            stroke-dasharray: 100 100;
            opacity: 1;
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-draw-circle {
          stroke-dasharray: 283;
          animation: draw-circle 0.6s ease-out forwards;
        }

        .animate-draw-check {
          stroke-dasharray: 100;
          animation: draw-check 0.4s ease-out 0.4s forwards;
        }

        .animate-confetti {
          animation: confetti-fall forwards;
        }
      `}</style>
    </div>
  );
}
