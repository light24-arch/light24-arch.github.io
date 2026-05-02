export interface GridConfig {
  row: string;
  image: string;
  text: string;
}

export function featureGrid(layout: string): GridConfig {
  switch (layout) {
    case 'image-left':
      return { row: 'items-end', image: 'col-span-12 md:col-span-7', text: 'col-span-12 md:col-span-4 md:col-start-9 pb-12' };
    case 'image-right':
      return { row: 'items-center', image: 'col-span-12 md:col-span-5 md:col-start-7 order-1 md:order-2', text: 'col-span-12 md:col-span-4 md:col-start-2 order-2 md:order-1 pt-12 md:pt-0' };
    case 'image-center':
      return { row: 'items-start', image: 'col-span-12 md:col-span-6 md:col-start-3', text: 'col-span-12 md:col-span-3 md:col-start-10 mt-12 md:mt-24' };
    case 'full-width':
      return { row: 'items-start', image: 'col-span-12', text: 'hidden' };
    case 'image-right-7':
      return { row: 'items-end', image: 'col-span-12 md:col-span-7 md:col-start-6', text: 'col-span-12 md:col-span-4 md:col-start-2 pb-12' };
    case 'transition-5':
      return { row: 'items-start', image: 'col-span-12 md:col-span-5', text: 'hidden' };
    case 'transition-7':
      return { row: 'items-start', image: 'col-span-12 md:col-span-7', text: 'hidden' };
    case 'transition-6':
      return { row: 'items-start', image: 'col-span-12 md:col-span-6 md:col-start-4', text: 'hidden' };
    case 'closing-7':
      return { row: 'items-start', image: 'col-span-12 md:col-span-7', text: 'hidden' };
    case 'image-left-wide':
      return { row: 'items-end', image: 'col-span-12 md:col-span-8', text: 'col-span-12 md:col-span-3 md:col-start-10 pb-12' };
    case 'image-right-wide':
      return { row: 'items-start', image: 'col-span-12 md:col-span-8 md:col-start-5', text: 'col-span-12 md:col-span-3 md:col-start-1 md:row-start-1 mt-12 md:mt-24' };
    case 'wide-transition':
      return { row: 'items-start', image: 'col-span-12 md:col-span-10 md:col-start-2', text: 'hidden' };
    case 'transition':
      return { row: 'items-start', image: 'col-span-12 md:col-span-9 md:col-start-2', text: 'hidden' };
    case 'wide':
      return { row: 'items-end', image: 'col-span-12 md:col-span-9', text: 'col-span-12 md:col-span-3 md:col-start-10 pb-8 mt-8 md:mt-0' };
    default:
      return { row: 'items-start', image: 'col-span-12 md:col-span-6 md:col-start-3', text: 'col-span-12 md:col-span-3 md:col-start-10 mt-12 md:mt-24' };
  }
}

export const hiddenLayouts = ['full-width', 'transition', 'wide-transition', 'transition-5', 'transition-6', 'transition-7', 'closing-7'];
