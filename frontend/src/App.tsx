import { useEffect, useState } from 'react';
import QuickSightQEmbed from './QuickSightQEmbed';

function App() {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [panelType, setPanelType] = useState<'FULL' | 'SEARCH_BAR'>('SEARCH_BAR');

  useEffect(() => {
    fetch('http://localhost:5000/api/get-embed-url')
      .then((res) => res.json())
      .then((data) => setEmbedUrl(data.embedUrl))
      .catch((err) => console.error('Failed to load embed URL', err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center text-white">
      <div className="w-full max-w-6xl px-4 py-8">
        <h1 className="text-5xl text-indigo-500 font-bold mb-6 text-center drop-shadow-lg">QuickSight Q Embedded</h1>
        
        <div className="mb-6 flex justify-center gap-4">
          <button 
            onClick={() => setPanelType('FULL')} 
            className={`px-4 py-2 rounded-md transition-colors ${
              panelType === 'FULL' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Full Panel
          </button>
          <button 
            onClick={() => setPanelType('SEARCH_BAR')} 
            className={`px-4 py-2 rounded-md transition-colors ${
              panelType === 'SEARCH_BAR' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Search Bar
          </button>
        </div>
        
        {embedUrl ? (
          <QuickSightQEmbed 
            embedUrl={embedUrl} 
            panelType={panelType}
          />
        ) : (
          <p className="text-center text-lg">Loading QuickSight Q&A...</p>
        )}

        <div className="mt-8 bg-white bg-opacity-20 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl text-indigo-600 font-semibold mb-4">How to Use</h2>
          <ol className="list-decimal pl-6 space-y-2 text-indigo-900">
            <li>Click "Show Q&A Panel" to reveal the QuickSight panel</li>
            <li>Use the preset buttons or type your own questions</li>
            <li>Toggle between Full Panel and Search Bar modes to see different layouts</li>
            <li>The panel will auto-open when using the preset question buttons</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;