import React from 'react';

export default function FontTestComponent() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Font Test - SF Compact Display Style</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Default System Font</h2>
          <p className="text-lg">
            This text is using the configured system font stack with Inter as primary and SF Compact Display characteristics.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Different Font Weights</h2>
          <div className="space-y-2">
            <p className="font-light text-lg">Light (300) - Clean and minimal</p>
            <p className="font-normal text-lg">Regular (400) - Standard body text</p>
            <p className="font-medium text-lg">Medium (500) - Slightly emphasized</p>
            <p className="font-semibold text-lg">Semibold (600) - Headlines and emphasis</p>
            <p className="font-bold text-lg">Bold (700) - Strong emphasis</p>
            <p className="font-extrabold text-lg">Extra Bold (800) - Maximum impact</p>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Using font-sf-compact Class</h2>
          <p className="font-sf-compact text-lg">
            This paragraph explicitly uses the font-sf-compact Tailwind class.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Numbers and Special Characters</h2>
          <p className="text-lg">
            1234567890 - !@#$%^&*() - These should display with consistent spacing and alignment.
          </p>
        </section>
        
        <section className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Current Font Stack:</h3>
          <code className="text-sm bg-white p-2 rounded block">
            Inter → Segoe UI → SF Compact Display → System Fonts
          </code>
          <p className="text-sm mt-2 text-gray-600">
            On Windows, you should see Inter. On Mac, it might use SF Compact Display if available.
          </p>
        </section>
      </div>
    </div>
  );
}