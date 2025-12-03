export interface ProcessedImage {
    name: string;
    blob: Blob;
    url: string;
    width: number;
    height: number;
    type: 'image/png' | 'image/jpeg' | 'image/x-icon';
  }
  
  export interface ImageDimensions {
    width: number;
    height: number;
  }
  
  export const FileFormat = {
    PNG: 'png',
    JPG: 'jpg',
    TGA: 'tga',
    UNKNOWN: 'unknown'
  } as const;
  
  export type FileFormat = typeof FileFormat[keyof typeof FileFormat];