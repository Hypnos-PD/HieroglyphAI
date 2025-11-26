export interface Variant {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  isCustom?: boolean;
}

export enum FilterStyle {
  ANY = '所有',
  ICON = '图标/Logo',
  ILLUSTRATION = '插画',
  PHOTO = '真实照片',
  ART = '艺术字',
}

export enum FilterSubject {
  ANY = '所有',
  PERSON = '人物/角色',
  ANIMAL = '动物',
  ABSTRACT = '抽象符号',
  PLACE = '地点/建筑',
}

export interface FilterSettings {
  style: FilterStyle;
  subject: FilterSubject;
  allowHomophone: boolean;
  excludeContent: string;
}

export interface SearchResult {
  id: string;
  char: string;
  query: string; // The full query or char used
  imageUrl?: string;
  fallbackQuery?: string; // If image fails, search for this
  explanation: string;
  sourceTitle?: string;
  sourceUrl?: string;
  variantId: string;
  loading: boolean;
  error?: string;
  isFavorite?: boolean;
}

export type Theme = 'ink' | 'green';

export interface AppState {
  apiKey: string;
  theme: Theme;
  currentVariantId: string;
  customVariants: Variant[];
  filters: FilterSettings;
  results: SearchResult[];
  favorites: SearchResult[];
  history: string[];
}
