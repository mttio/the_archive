export interface TextBlock {
  type: 'text';
  id: string;
  value: string;
}

export interface HeadingBlock {
  type: 'heading';
  id: string;
  level: 2 | 3;
  value: string;
}

export interface ListBlock {
  type: 'list';
  id: string;
  listType: 'bullet' | 'number';
  items: string[];
}

export interface ImageBlock {
  type: 'image';
  id: string;
  url: string;
  caption: string;
  layout: 'center' | 'wide' | 'full';
}

export interface CarouselSlide {
  url: string;
  caption: string;
}

export interface CarouselBlock {
  type: 'carousel';
  id: string;
  slides: CarouselSlide[];
}

export type BlockItem =
  | TextBlock
  | HeadingBlock
  | ListBlock
  | ImageBlock
  | CarouselBlock;
