'use client';

export default function ColorsTestPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SafeHaven Colors Test</h1>
        <p className="text-gray-600 dark:text-gray-400">Visual reference for all brand colors</p>
      </div>
      
      {/* Primary Colors */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Primary Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-8 bg-brand-500 text-white rounded-lg shadow-lg text-center">
            <div className="text-2xl font-bold mb-2">Safe Blue</div>
            <div className="text-sm opacity-90">#1F4E79</div>
            <div className="text-xs mt-2 opacity-75">Primary brand color</div>
          </div>
          <div className="p-8 bg-emergency-500 text-white rounded-lg shadow-lg text-center">
            <div className="text-2xl font-bold mb-2">Emergency Red</div>
            <div className="text-sm opacity-90">#C62828</div>
            <div className="text-xs mt-2 opacity-75">SOS & critical alerts</div>
          </div>
          <div className="p-8 bg-electric-500 text-gray-900 rounded-lg shadow-lg text-center">
            <div className="text-2xl font-bold mb-2">Electric Yellow</div>
            <div className="text-sm opacity-90">#FBC02D</div>
            <div className="text-xs mt-2 opacity-75">Warnings & highlights</div>
          </div>
        </div>
      </div>
      
      {/* Disaster Colors */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Disaster-Specific Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-orange-500 text-white rounded-lg shadow text-center">
            <div className="text-xl font-bold mb-1">🔥 Fire Orange</div>
            <div className="text-sm opacity-90">#F57C00</div>
            <div className="text-xs mt-2 opacity-75">Fire alerts & heat warnings</div>
          </div>
          <div className="p-6 bg-storm-500 text-white rounded-lg shadow text-center">
            <div className="text-xl font-bold mb-1">🌊 Storm Blue</div>
            <div className="text-sm opacity-90">#1976D2</div>
            <div className="text-xs mt-2 opacity-75">Floods & storm warnings</div>
          </div>
          <div className="p-6 bg-electric-500 text-gray-900 rounded-lg shadow text-center">
            <div className="text-xl font-bold mb-1">⚡ Electric Yellow</div>
            <div className="text-sm opacity-90">#FBC02D</div>
            <div className="text-xs mt-2 opacity-75">Power outages & lightning</div>
          </div>
        </div>
      </div>
      
      {/* Semantic Colors */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Semantic Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-success-500 text-white rounded-lg shadow text-center">
            <div className="text-lg font-bold mb-1">✅ Success</div>
            <div className="text-sm opacity-90">#2E7D32</div>
          </div>
          <div className="p-6 bg-info-500 text-white rounded-lg shadow text-center">
            <div className="text-lg font-bold mb-1">ℹ️ Info</div>
            <div className="text-sm opacity-90">#0288D1</div>
          </div>
          <div className="p-6 bg-warning-500 text-white rounded-lg shadow text-center">
            <div className="text-lg font-bold mb-1">⚠️ Warning</div>
            <div className="text-sm opacity-90">#FFA000</div>
          </div>
          <div className="p-6 bg-error-500 text-white rounded-lg shadow text-center">
            <div className="text-lg font-bold mb-1">❌ Error</div>
            <div className="text-sm opacity-90">#D32F2F</div>
          </div>
        </div>
      </div>
      
      {/* Safe Blue Shades */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Safe Blue Shades</h2>
        <div className="grid grid-cols-11 gap-2">
          <div className="p-4 bg-brand-50 text-gray-900 rounded text-center text-xs font-medium">50</div>
          <div className="p-4 bg-brand-100 text-gray-900 rounded text-center text-xs font-medium">100</div>
          <div className="p-4 bg-brand-200 text-gray-900 rounded text-center text-xs font-medium">200</div>
          <div className="p-4 bg-brand-300 text-white rounded text-center text-xs font-medium">300</div>
          <div className="p-4 bg-brand-400 text-white rounded text-center text-xs font-medium">400</div>
          <div className="p-4 bg-brand-500 text-white rounded text-center text-xs font-bold border-2 border-white">500</div>
          <div className="p-4 bg-brand-600 text-white rounded text-center text-xs font-medium">600</div>
          <div className="p-4 bg-brand-700 text-white rounded text-center text-xs font-medium">700</div>
          <div className="p-4 bg-brand-800 text-white rounded text-center text-xs font-medium">800</div>
          <div className="p-4 bg-brand-900 text-white rounded text-center text-xs font-medium">900</div>
          <div className="p-4 bg-brand-950 text-white rounded text-center text-xs font-medium">950</div>
        </div>
      </div>
      
      {/* Emergency Red Shades */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Emergency Red Shades</h2>
        <div className="grid grid-cols-10 gap-2">
          <div className="p-4 bg-emergency-50 text-gray-900 rounded text-center text-xs font-medium">50</div>
          <div className="p-4 bg-emergency-100 text-gray-900 rounded text-center text-xs font-medium">100</div>
          <div className="p-4 bg-emergency-200 text-gray-900 rounded text-center text-xs font-medium">200</div>
          <div className="p-4 bg-emergency-300 text-white rounded text-center text-xs font-medium">300</div>
          <div className="p-4 bg-emergency-400 text-white rounded text-center text-xs font-medium">400</div>
          <div className="p-4 bg-emergency-500 text-white rounded text-center text-xs font-bold border-2 border-white">500</div>
          <div className="p-4 bg-emergency-600 text-white rounded text-center text-xs font-medium">600</div>
          <div className="p-4 bg-emergency-700 text-white rounded text-center text-xs font-medium">700</div>
          <div className="p-4 bg-emergency-800 text-white rounded text-center text-xs font-medium">800</div>
          <div className="p-4 bg-emergency-900 text-white rounded text-center text-xs font-medium">900</div>
        </div>
      </div>
      
      {/* Button Examples */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Button Examples</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium">
            Primary Button
          </button>
          <button className="px-6 py-3 bg-emergency-500 text-white rounded-lg hover:bg-emergency-600 transition-colors font-medium">
            Emergency Button
          </button>
          <button className="px-6 py-3 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors font-medium">
            Success Button
          </button>
          <button className="px-6 py-3 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-colors font-medium">
            Warning Button
          </button>
          <button className="px-6 py-3 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors font-medium">
            Error Button
          </button>
          <button className="px-6 py-3 bg-info-500 text-white rounded-lg hover:bg-info-600 transition-colors font-medium">
            Info Button
          </button>
        </div>
      </div>
      
      {/* Alert Examples */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Alert Examples</h2>
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
            <h3 className="text-orange-700 font-semibold mb-1">🔥 Fire Alert</h3>
            <p className="text-orange-600 text-sm">Fire detected in your area. Evacuate immediately.</p>
          </div>
          <div className="p-4 bg-storm-50 border-l-4 border-storm-500 rounded-lg">
            <h3 className="text-storm-700 font-semibold mb-1">🌊 Storm Warning</h3>
            <p className="text-storm-600 text-sm">Heavy rainfall expected. Prepare for possible flooding.</p>
          </div>
          <div className="p-4 bg-electric-50 border-l-4 border-electric-500 rounded-lg">
            <h3 className="text-electric-700 font-semibold mb-1">⚡ Power Outage</h3>
            <p className="text-electric-600 text-sm">Power outage reported in your area.</p>
          </div>
          <div className="p-4 bg-success-50 border-l-4 border-success-500 rounded-lg">
            <h3 className="text-success-700 font-semibold mb-1">✅ All Clear</h3>
            <p className="text-success-600 text-sm">The emergency situation has been resolved.</p>
          </div>
        </div>
      </div>
      
      {/* Text Colors */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Text Colors</h2>
        <div className="space-y-2 bg-white dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-brand-500 font-medium">Safe Blue Text (#1F4E79)</p>
          <p className="text-emergency-500 font-medium">Emergency Red Text (#C62828)</p>
          <p className="text-orange-500 font-medium">Fire Orange Text (#F57C00)</p>
          <p className="text-storm-500 font-medium">Storm Blue Text (#1976D2)</p>
          <p className="text-electric-500 font-medium">Electric Yellow Text (#FBC02D)</p>
          <p className="text-success-500 font-medium">Success Green Text (#2E7D32)</p>
          <p className="text-error-500 font-medium">Error Red Text (#D32F2F)</p>
          <p className="text-warning-500 font-medium">Warning Amber Text (#FFA000)</p>
          <p className="text-info-500 font-medium">Info Blue Text (#0288D1)</p>
        </div>
      </div>
    </div>
  );
}
