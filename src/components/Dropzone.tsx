import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validExtensions = ['png', 'jpg', 'jpeg', 'tga'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !validExtensions.includes(extension)) {
      setError("Invalid file format. Please upload PNG, JPG, or TGA.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  return (
    <div 
      className={`relative group w-full max-w-xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
        ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800'}
        ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleChange}
        accept=".png,.jpg,.jpeg,.tga"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4 text-center">
        {isProcessing ? (
          <div className="animate-pulse flex flex-col items-center">
             <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-slate-600 animate-spin mb-4"></div>
             <p className="text-slate-300 font-medium">Processing Image...</p>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-700'}`}>
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">
              Upload your image
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
              Drag and drop or click to select. <br/>
              <span className="text-slate-500 text-xs mt-2 block">Supported: PNG, JPG, TGA</span>
            </p>
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-sm mt-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dropzone;