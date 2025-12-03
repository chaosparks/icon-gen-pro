/**
 * A minimal TGA parser to handle common uncompressed RGB/RGBA TGA files.
 * This is required because browsers do not natively support .tga files.
 */

 export const parseTga = (buffer: ArrayBuffer): ImageData | null => {
    const data = new Uint8Array(buffer);
  
    // TGA Header (18 bytes)
    // Offset 2: Image Type (2 = Uncompressed RGB, 10 = RLE RGB)
    // Offset 12: Width (2 bytes, little-endian)
    // Offset 14: Height (2 bytes, little-endian)
    // Offset 16: Pixel Depth (bits per pixel)
    // Offset 17: Image Descriptor (checking for flip bits)
  
    if (data.length < 18) {
      console.error("File too small to be TGA");
      return null;
    }
  
    const idLength = data[0];
    const imageType = data[2];
    const width = data[12] | (data[13] << 8);
    const height = data[14] | (data[15] << 8);
    const pixelDepth = data[16];
    const descriptor = data[17];
  
    // We primarily support Uncompressed True-Color (Type 2) for simplicity in this constrained environment.
    // Basic RLE (Type 10) support is omitted to keep code within reasonable complexity limits,
    // but this covers the vast majority of simple asset exports.
    if (imageType !== 2 && imageType !== 3) {
        console.warn(`TGA Image Type ${imageType} not fully supported in this lightweight parser. Only uncompressed RGB/Grayscale supported.`);
        // Depending on requirements, we might throw or return null.
        if (imageType === 10) {
          throw new Error("RLE Compressed TGA files are not currently supported. Please save as Uncompressed TGA.");
        }
        return null;
    }
  
    const bytesPerPixel = pixelDepth / 8;
    if (bytesPerPixel !== 3 && bytesPerPixel !== 4 && bytesPerPixel !== 1) {
      throw new Error(`Unsupported pixel depth: ${pixelDepth} bits`);
    }
  
    const imageSize = width * height * bytesPerPixel;
    // Offset to pixel data: 18 + ID Length + Color Map Length (usually 0 for RGB)
    // Note: We are assuming no Color Map for Type 2.
    let offset = 18 + idLength;
  
    // Check if file is large enough
    if (data.length < offset + imageSize) {
      throw new Error("TGA file appears truncated.");
    }
  
    const imageData = new Uint8ClampedArray(width * height * 4);
    
    // TGA pixels are usually stored Bottom-to-Top, Left-to-Right unless bit 5 of descriptor is set.
    // Bit 5 (0x20): 0 = Bottom-Left origin, 1 = Top-Left origin.
    const isTopLeft = (descriptor & 0x20) !== 0;
  
    for (let y = 0; y < height; y++) {
      // Calculate the target row index in our RGBA buffer (Top-to-Bottom)
      const targetY = isTopLeft ? y : (height - 1 - y);
      
      for (let x = 0; x < width; x++) {
        const srcIdx = offset + (y * width + x) * bytesPerPixel;
        const dstIdx = (targetY * width + x) * 4;
  
        if (bytesPerPixel === 3 || bytesPerPixel === 4) {
          // TGA is usually BGR or BGRA
          const b = data[srcIdx];
          const g = data[srcIdx + 1];
          const r = data[srcIdx + 2];
          const a = bytesPerPixel === 4 ? data[srcIdx + 3] : 255;
  
          imageData[dstIdx] = r;
          imageData[dstIdx + 1] = g;
          imageData[dstIdx + 2] = b;
          imageData[dstIdx + 3] = a;
        } else if (bytesPerPixel === 1) {
          // Grayscale
          const val = data[srcIdx];
          imageData[dstIdx] = val;
          imageData[dstIdx + 1] = val;
          imageData[dstIdx + 2] = val;
          imageData[dstIdx + 3] = 255;
        }
      }
    }
  
    return new ImageData(imageData, width, height);
  };
  