import type { ImgHTMLAttributes } from 'react';
import { responsiveImage } from '../utils/images';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & { src: string; alt: string };

export default function ResponsiveImage({ src, alt, sizes = '100vw', loading = 'lazy', ...props }: Props) {
  return <img {...responsiveImage(src)} {...props} alt={alt} sizes={sizes} loading={loading} decoding="async" />;
}
