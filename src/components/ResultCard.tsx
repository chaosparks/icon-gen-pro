import React from 'react';
import { Download } from 'lucide-react';
import type { ProcessedImage } from '../types';
import { saveBlob } from '../services/imageProcessor';

interface ResultCardProps {
  image: ProcessedImage;
}

const ResultCard: React.FC<ResultCardProps> = ({ image }) => {
  const handleDownload = () => {
    saveBlob(image.blob, image.name);
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all group flex flex-col">
      <div className="aspect-square bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Checkerboard background for transparency simulation */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)',
               backgroundSize: '20px 20px',
               backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
             }} 
        />
        
        <img 
          src={image.url} 
          alt={image.name} 
          className="relative z-10 max-w-full max-h-full object-contain shadow-lg"
        />
        
        <button 
          onClick={handleDownload}
          className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
          title="Download"
        >
          <Download size={18} />
        </button>
      </div>
      
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-medium text-slate-200 truncate pr-2" title={image.name}>{image.name}</h4>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
            {image.width}x{image.height}
          </span>
        </div>
        <div className="text-xs text-slate-500 uppercase font-semibold">
           {image.type.split('/')[1].replace('x-icon', 'ICO')}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;