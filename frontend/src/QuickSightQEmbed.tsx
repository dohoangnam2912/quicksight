import { useEffect, useRef, useState } from 'react';

type QuickSightQEmbedProps = {
  embedUrl: string;
};

declare global {
  interface Window {
    QuickSightEmbedding?: any;
  }
}

const QuickSightQEmbed = ({ embedUrl }: QuickSightQEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);

  useEffect(() => {
    let isEmbedded = false;

    const loadScript = () => {
      if (!window.QuickSightEmbedding) {
        const script = document.createElement('script');
        script.src =
          'https://unpkg.com/amazon-quicksight-embedding-sdk@2.10.0/dist/quicksight-embedding-js-sdk.min.js';
        script.onload = initEmbedding;
        document.body.appendChild(script);
      } else {
        initEmbedding();
      }
    };

    const initEmbedding = async () => {
      if (isEmbedded || !embedUrl) return;
      isEmbedded = true;

      try {
        console.log('📦 Loading QuickSight Q with URL:', embedUrl);

        const { createEmbeddingContext } = window.QuickSightEmbedding;
        const embeddingContext = await createEmbeddingContext();

        const frameOptions = {
          url: embedUrl,
          container: containerRef.current!,
          height: '800px',
          width: '100%',
          onChange: (changeEvent: any) => {
            console.log('🌀 Frame Event:', changeEvent);
          },
        };

        const contentOptions = {
          panelOptions: {
            panelType: 'FULL',
            title: 'Teacherzone Q&A',
            showQIcon: true,
          },
          /*
                    panelOptions: {
                        panelType: 'SEARCH_BAR',
                        focusedHeight: '250px',
                        expandedHeight: '500px',
                    },
                    */
          searchPlaceholderText: 'Ask your teacher question ...',
          allowFullscreen: false,
          allowTopicSelection: true,
          showTopicName: true,
          onMessage: (messageEvent: any) => {
            console.log('📨 Q Event:', messageEvent);
            if (messageEvent.eventName === 'ERROR_OCCURRED') {
              setEmbedError(`Embed Error: ${messageEvent?.errorCode}`);
            }
          },
        };

        await embeddingContext.embedGenerativeQnA(frameOptions, contentOptions);
        console.log('Q&A panel embedded successfully');
      } catch (err: any) {
        console.error('Failed to embed Q:', err);
        setEmbedError('Failed to embed Q experience. See console for details.');
      }
    };

    if (embedUrl) loadScript();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [embedUrl]);

  return (
    <>
      <div ref={containerRef} className="rounded-xl shadow-lg overflow-hidden"></div>
      {embedError && (
        <div className="text-red-500 mt-4 text-center">
           {embedError}
        </div>
      )}
    </>
  );  
};

export default QuickSightQEmbed;
