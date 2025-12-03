import React, { useState } from 'react';
import Dropzone from './components/Dropzone';
import ResultCard from './components/ResultCard';
import type { ProcessedImage } from './types';
import { processUpload, downloadAllAsZip } from './services/imageProcessor';
import { Layers, DownloadCloud, RotateCcw, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setSourceFileName(file.name);
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      const results = await processUpload(file);
      setProcessedImages(results);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while processing the image.");
      setSourceFileName(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setProcessedImages([]);
    setSourceFileName(null);
  };

  const handleDownloadAll = () => {
    if (processedImages.length > 0) {
      downloadAllAsZip(processedImages);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 font-sans">
      {/* Header */}
      <header className="flex-none border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Layers size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">IconGen Pro</h1>
              <p className="text-xs text-slate-400 font-medium">Multi-format Asset Generator</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            v1.0.0 • Local Processing
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6 md:py-12 flex flex-col">
        
        {/* Intro / Empty State - Flexbox ensures exact center positioning */}
        {processedImages.length === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center py-10">
            <div className="text-center mb-8 md:mb-12 max-w-2xl px-4">
              <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 mb-4 md:mb-6 pb-2 leading-tight">
                Generate Perfect Assets in Seconds
              </h2>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-lg mx-auto">
                Upload your master image (PNG, JPG, TGA) to automatically generate optimized favicons, app icons, and thumbnails.
                <br/>
                <span className="text-sm text-slate-500 mt-2 block font-mono">Recommended: 256x256 or 512x512</span>
              </p>
            </div>
            
            <Dropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          </div>
        )}

        {/* Results View */}
        {processedImages.length > 0 && (
          <div className="animate-fade-in-up w-full">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex-shrink-0">
                  <ImageIcon size={24} className="text-blue-400" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-lg font-semibold text-white whitespace-nowrap">Generation Complete</h3>
                  <p className="text-sm text-slate-400 truncate w-full">Source: <span className="font-mono text-slate-300">{sourceFileName}</span></p>
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={handleReset}
                  className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors flex font-medium text-sm"
                >
                  <RotateCcw size={16} />
                  New Upload
                </button>
                <button 
                  onClick={handleDownloadAll}
                  className="flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all flex font-medium text-sm transform hover:scale-105"
                >
                  <DownloadCloud size={18} />
                  Download ZIP
                </button>
              </div>
            </div>

            {/* Grid - Responsive columns: 1 on mobile, 2 on small tablets, 3 on tablets, 4 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {processedImages.map((img, idx) => (
                <ResultCard key={idx} image={img} />
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="flex-none border-t border-slate-800 mt-auto py-6 md:py-8 text-center text-slate-500 text-sm bg-slate-950">
        <p>&copy; {new Date().getFullYear()} IconGen Pro. Processed securely in your browser.</p>
      </footer>
    </div>
  );
};

export default App;