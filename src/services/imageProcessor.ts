import type { ProcessedImage } from '../types';
import { parseTga } from './tgaParser';
import JSZip from 'jszip';

// Helper to save Blob directly without external dependency
export const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper to load an image file into a HTMLImageElement
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Helper to convert an ImageData object (from TGA) to HTMLImageElement via a temporary canvas
const imageDataToImage = (imageData: ImageData): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject("Canvas context unavailable");
    
    ctx.putImageData(imageData, 0, 0);
    
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = canvas.toDataURL(); // Convert to base64 PNG so Image can read it
  });
};

// Simple ICO generator. Creates a basic ICO container wrapping a PNG.
// Standard ICO header: Reserved(2) | Type(2) | Count(2)
// Directory Entry: Width(1) | Height(1) | Colors(1) | Reserved(1) | Planes(2) | BPP(2) | Size(4) | Offset(4)
const generateIco = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob(async (pngBlob) => {
      if (!pngBlob) return;
      const pngBuffer = await pngBlob.arrayBuffer();
      const pngData = new Uint8Array(pngBuffer);
      const size = pngData.length;
      
      const buffer = new ArrayBuffer(6 + 16 + size);
      const view = new DataView(buffer);
      
      // Header
      view.setUint16(0, 0, true); // Reserved
      view.setUint16(2, 1, true); // Type 1 = ICO
      view.setUint16(4, 1, true); // Image count (1)

      // Directory Entry
      const width = canvas.width >= 256 ? 0 : canvas.width; // 0 means 256
      const height = canvas.height >= 256 ? 0 : canvas.height;
      
      view.setUint8(6, width);
      view.setUint8(7, height);
      view.setUint8(8, 0); // Palette color count (0 = no palette)
      view.setUint8(9, 0); // Reserved
      view.setUint16(10, 1, true); // Color planes
      view.setUint16(12, 32, true); // Bits per pixel
      view.setUint32(14, size, true); // Image size in bytes
      view.setUint32(18, 22, true); // Offset to image data (6 header + 16 entry)

      // Image Data
      const bytes = new Uint8Array(buffer);
      bytes.set(pngData, 22);

      resolve(new Blob([buffer], { type: 'image/x-icon' }));
    }, 'image/png');
  });
};

export const processUpload = async (file: File): Promise<ProcessedImage[]> => {
  let img: HTMLImageElement;

  // Handle TGA specifically
  if (file.name.toLowerCase().endsWith('.tga')) {
    const buffer = await file.arrayBuffer();
    const imageData = parseTga(buffer);
    if (!imageData) throw new Error("Failed to parse TGA file.");
    img = await imageDataToImage(imageData);
  } else {
    // PNG or JPG
    img = await loadImage(file);
  }

  const results: ProcessedImage[] = [];

  // 1. favicon.ico (48x48)
  const cvsFav = document.createElement('canvas');
  cvsFav.width = 48;
  cvsFav.height = 48;
  const ctxFav = cvsFav.getContext('2d');
  if (ctxFav) {
    ctxFav.imageSmoothingEnabled = true;
    ctxFav.imageSmoothingQuality = 'high';
    ctxFav.drawImage(img, 0, 0, img.width, img.height, 0, 0, 48, 48);
    
    const icoBlob = await generateIco(cvsFav);
    results.push({
      name: 'favicon.ico',
      blob: icoBlob,
      url: URL.createObjectURL(icoBlob),
      width: 48,
      height: 48,
      type: 'image/x-icon'
    });
  }

  // 2. Standard PNG Icons (128, 48, 32, 16)
  const createPng = async (size: number, name: string) => {
    const cvs = document.createElement('canvas');
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size);
    
    const pngBlob = await new Promise<Blob | null>(r => cvs.toBlob(r, 'image/png'));
    if (pngBlob) {
      results.push({
        name,
        blob: pngBlob,
        url: URL.createObjectURL(pngBlob),
        width: size,
        height: size,
        type: 'image/png'
      });
    }
  };

  await createPng(128, 'icon128.png');
  await createPng(48, 'icon48.png');
  await createPng(32, 'icon32.png');
  await createPng(16, 'icon16.png');

  // 3. thumb_1.jpg (256x192) - Vertical Center Crop
  const cvsThumb1 = document.createElement('canvas');
  cvsThumb1.width = 256;
  cvsThumb1.height = 192;
  const ctxThumb1 = cvsThumb1.getContext('2d');
  if (ctxThumb1) {
    ctxThumb1.imageSmoothingEnabled = true;
    ctxThumb1.imageSmoothingQuality = 'high';
    
    const scaleFactor = img.width / 256;
    const sourceHeightReq = 192 * scaleFactor;
    const sourceY = (img.height - sourceHeightReq) / 2;
    
    // White background for JPG in case of transparency
    ctxThumb1.fillStyle = '#FFFFFF';
    ctxThumb1.fillRect(0, 0, 256, 192);

    ctxThumb1.drawImage(
      img, 
      0, sourceY, img.width, sourceHeightReq, // Source crop
      0, 0, 256, 192 // Dest
    );

    const jpgBlob = await new Promise<Blob | null>(r => cvsThumb1.toBlob(r, 'image/jpeg', 0.9));
    if (jpgBlob) {
      results.push({
        name: 'thumb_1.jpg',
        blob: jpgBlob,
        url: URL.createObjectURL(jpgBlob),
        width: 256,
        height: 192,
        type: 'image/jpeg'
      });
    }
  }

  // 4. thumb_2.jpg (256x256)
  const cvsThumb2 = document.createElement('canvas');
  cvsThumb2.width = 256;
  cvsThumb2.height = 256;
  const ctxThumb2 = cvsThumb2.getContext('2d');
  if (ctxThumb2) {
    ctxThumb2.imageSmoothingEnabled = true;
    ctxThumb2.imageSmoothingQuality = 'high';
    
    // White background for JPG
    ctxThumb2.fillStyle = '#FFFFFF';
    ctxThumb2.fillRect(0, 0, 256, 256);

    ctxThumb2.drawImage(img, 0, 0, img.width, img.height, 0, 0, 256, 256);
    
    const jpgBlob = await new Promise<Blob | null>(r => cvsThumb2.toBlob(r, 'image/jpeg', 0.9));
    if (jpgBlob) {
      results.push({
        name: 'thumb_2.jpg',
        blob: jpgBlob,
        url: URL.createObjectURL(jpgBlob),
        width: 256,
        height: 256,
        type: 'image/jpeg'
      });
    }
  }

  return results;
};

export const downloadAllAsZip = async (images: ProcessedImage[]) => {
  const zip = new JSZip();
  images.forEach(img => {
    zip.file(img.name, img.blob);
  });
  
  const content = await zip.generateAsync({ type: "blob" });
  saveBlob(content, "generated_icons.zip");
};