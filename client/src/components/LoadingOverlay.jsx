// client/src/components/LoadingOverlay.jsx
// Full-screen loading indicator with animated gradient and pulse
// WHY: AI calls take 5-15 seconds. A premium loading state keeps users engaged
// and prevents them from thinking the app is broken.

import React from 'react';

const LoadingOverlay = ({ message = 'Analyzing your code...', visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-editor-bg/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Animated rings */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-accent-violet/40 animate-pulse" />
          <div className="absolute inset-4 rounded-full border-2 border-accent-cyan/50 animate-spin"
               style={{ animationDuration: '3s', borderTopColor: 'transparent' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-text-primary font-medium text-lg">{message}</p>
          <p className="text-text-muted text-sm mt-1">This may take a few seconds</p>
        </div>

        {/* Shimmer bar */}
        <div className="w-64 h-1 rounded-full overflow-hidden bg-editor-card">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-violet animate-[shimmer_1.5s_ease-in-out_infinite]"
               style={{
                 animation: 'loading-bar 1.5s ease-in-out infinite',
               }} />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
