import { useEffect, useState } from 'react';
import QuickSightQEmbed from './QuickSightQEmbed';

function App() {
  const [embedUrl, setEmbedUrl] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:5000/api/get-embed-url')
      .then((res) => res.json())
      .then((data) => setEmbedUrl(data.embedUrl))
      .catch((err) => console.error('Failed to load embed URL', err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center text-white">
      <div className="w-full max-w-6xl px-4">
        <h1 className="text-5xl text-indigo-500 font-bold mb-6 text-center drop-shadow-lg">QuickSight Q Embedded (TSX)</h1>
        {embedUrl ? (
          // <div className='absolute w-full max-w-6xl'>
            <QuickSightQEmbed embedUrl={embedUrl} />
          // </div>
        ) : (
          <p className="text-center text-lg">Loading QuickSight Q&A...</p>
        )}
      </div>
    </div>
  );
}

export default App;
