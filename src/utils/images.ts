import imageManifest from '../generated/image-manifest.json';

interface ImageData {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}
const images: Record<string, ImageData> = imageManifest;

export function responsiveImage(src: string) {
  const image = images[src];
  if (!image) throw new Error(`Image is missing from the build manifest: ${src}`);
  return image;
}
