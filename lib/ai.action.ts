import puter from "@heyputer/puter.js";
import { data } from "react-router";
import { SPATIOM_RENDER_PROMPT } from "./constants";

export const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = reject;
    
    reader.readAsDataURL(blob);
  });
};

const getImageDimensions = (base64Data: string): Promise<{ w: number; h: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.width, h: img.height });
    };
    img.src = base64Data;
  });
};

export const generate3DView = async ({sourceImage} : Generate3DViewParams) => {
  const dataUrl = sourceImage.startsWith('data:')
    ? sourceImage
    : await fetchAsDataUrl(sourceImage);

  const base64Data = dataUrl.split(',')[1];
  const mimeType = dataUrl.split(';')[0].split(':')[1];

  if (!mimeType || !base64Data) throw new Error('invalid source image payload');

  // 1. Dapatkan ukuran asli gambar denah
  const dimensions = await getImageDimensions(dataUrl);

  // 2. Kirim ratio yang sesuai ke AI (atau gunakan batas max 1024)
  const maxDim = 1024;
  const isPortrait = dimensions.h > dimensions.w;
  
  const targetWidth = isPortrait 
    ? Math.round(maxDim * (dimensions.w / dimensions.h)) 
    : maxDim;
  const targetHeight = isPortrait 
    ? maxDim 
    : Math.round(maxDim * (dimensions.h / dimensions.w));

  const response = await puter.ai.txt2img(SPATIOM_RENDER_PROMPT, {
    provider: "gemini",
    model: "gemini-2.5-flash-image-preview",
    input_image: base64Data,
    input_image_mime_type: mimeType,
    ratio: { w: targetWidth, h: targetHeight },
  })

  const rawImageUrl = (response as HTMLImageElement).src ?? null;

  if (!rawImageUrl) return {renderedImage: null, renderedPath: undefined};

  const renderedImage = rawImageUrl.startsWith('data:')
  ? rawImageUrl : await fetchAsDataUrl(rawImageUrl);

  return { renderedImage, renderedPath: undefined};
}