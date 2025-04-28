import { useEffect, useRef, useState } from 'react';

type QuickSightQEmbedProps = {
  embedUrl: string;
  panelType?: 'FULL' | 'SEARCH_BAR';
  initialQuestion?: string;
};

declare global {
  interface Window {
    QuickSightEmbedding?: any;
  }
}

const QuickSightQEmbed = ({ 
  embedUrl, 
  panelType = 'FULL',
  initialQuestion 
}: QuickSightQEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [embeddedExperience, setEmbeddedExperience] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setQuestion = (question: string) => {
    if (embeddedExperience) {
      console.log(`Setting question: "${question}"`);
      if (!isVisible) {
        setIsVisible(true);
      }
      embeddedExperience.setQuestion(question);
    } else {
      console.error('Embedded experience not available yet');
      // Initialize and then set question
      setIsVisible(true);
      if (!isInitialized) {
        loadEmbedding().then(() => {
          // We need to wait a bit for the experience to be ready
          setTimeout(() => {
            if (embeddedExperience) {
              embeddedExperience.setQuestion(question);
            }
          }, 1000);
        });
      }
    }
  };

  const closePanel = () => {
    if (embeddedExperience && panelType === 'SEARCH_BAR') {
      embeddedExperience.close();
    }
    setIsVisible(false);
  };

  const toggleVisibility = () => {
    if (isVisible) {
      closePanel();
    } else {
      setIsVisible(true);
      // If we're showing it for the first time, make sure it's initialized
      if (!isInitialized) {
        loadEmbedding();
      }
    }
  };

  const loadEmbedding = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    if (!window.QuickSightEmbedding) {
      const script = document.createElement('script');
      script.src =
        'https://unpkg.com/amazon-quicksight-embedding-sdk@2.10.0/dist/quicksight-embedding-js-sdk.min.js';
      script.onload = () => initEmbedding();
      document.body.appendChild(script);
    } else {
      await initEmbedding();
    }
    
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (isInitialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  };

  const initEmbedding = async () => {
    if (isInitialized || !embedUrl) return;
    
    try {
      console.log('📦 Loading QuickSight Q with URL:', embedUrl);

      const { createEmbeddingContext } = window.QuickSightEmbedding;
      const embeddingContext = await createEmbeddingContext();

      const frameOptions = {
        url: embedUrl,
        container: containerRef.current!,
        height: panelType === 'FULL' ? '700px' : '56px', // Default height for search bar
        width: '100%',
        className: panelType === 'SEARCH_BAR' ? 'quicksight-search-bar' : '',
        onChange: (changeEvent: any) => {
          console.log('🌀 Frame Event:', changeEvent);
          if (changeEvent.eventName === 'FRAME_LOADED') {
            setIsLoading(false);
          }
        },
      };

      const contentOptions = {
        panelOptions: panelType === 'FULL' 
          ? {
              panelType: 'FULL',
              title: 'Data Q&A',
              showQIcon: true,
            }
          : {
              panelType: 'SEARCH_BAR',
              focusedHeight: '250px',
              expandedHeight: '500px',
            },
        searchPlaceholderText: 'Ask a question about your data...',
        allowFullscreen: true,
        allowTopicSelection: true,
        showTopicName: true,
        onMessage: (messageEvent: any) => {
          console.log('📨 Q Event:', messageEvent);
          if (messageEvent.eventName === 'ERROR_OCCURRED') {
            setEmbedError(`Embed Error: ${messageEvent?.errorCode}`);
            setIsLoading(false);
          } else if (messageEvent.eventName === 'CONTENT_LOADED') {
            console.log('QuickSight content loaded successfully');
          } else if (messageEvent.eventName === 'Q_SEARCH_OPENED') {
            console.log('Search bar expanded');
          } else if (messageEvent.eventName === 'Q_SEARCH_CLOSED') {
            console.log('Search bar collapsed');
          }
        },
      };

      const experience = await embeddingContext.embedGenerativeQnA(frameOptions, contentOptions);
      setEmbeddedExperience(experience);
      setIsInitialized(true);
      
      // If an initial question was provided, set it after initialization
      if (initialQuestion) {
        setTimeout(() => {
          experience.setQuestion(initialQuestion);
        }, 1000); // Give it a second to fully initialize
      }
      
      console.log('Q&A panel embedded successfully');
    } catch (err: any) {
      console.error('Failed to embed Q:', err);
      setEmbedError('Failed to embed Q experience. See console for details.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load and initialize if it's set to visible initially
    if (isVisible && embedUrl && !isInitialized) {
      loadEmbedding();
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [embedUrl, isVisible]);

  // Add CSS for the search bar positioning when using that panel type
  useEffect(() => {
    if (panelType === 'SEARCH_BAR') {
      const style = document.createElement('style');
      style.textContent = `
        .quicksight-search-bar {
          position: absolute;
          z-index: 100;
          left: 0;
          width: 100% !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [panelType]);

  return (
    <div className="relative">
      <div className="mb-4 flex gap-2 justify-center">
        <button 
          onClick={toggleVisibility}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isVisible ? 'Hide Q&A Panel' : 'Show Q&A Panel'}
        </button>
        
        <button 
          onClick={() => setQuestion('show me monthly revenue')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Show Monthly Revenue
        </button>
        
        <button 
          onClick={() => setQuestion('what is our year-to-date sales?')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          YTD Sales
        </button>
      </div>
      
      {isLoading && (
        <div className="text-center my-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-indigo-600">Loading QuickSight...</p>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 h-0'
        } ${panelType === 'SEARCH_BAR' ? 'min-h-[56px]' : ''}`}
      ></div>
      
      {embedError && (
        <div className="text-red-500 mt-4 text-center">
           {embedError}
        </div>
      )}
    </div>
  );  
};

export default QuickSightQEmbed;