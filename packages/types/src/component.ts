/**
 * Component category types
 */
export type ComponentCategory =
  | 'header'
  | 'hero'
  | 'pricing'
  | 'testimonials'
  | 'about'
  | 'features'
  | 'footer'
  | 'cta'
  | 'faq';

/**
 * Component tier types
 */
export type ComponentTier = 'free' | 'paid';

/**
 * Main component interface
 */
export interface Component {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ComponentCategory | string;
  tier: ComponentTier;
  promptContent: string;
  previewImageUrl?: string | null;
  previewCode?: string | null;
  tags: string[];
  copyCount: number;
  createdAt: string | Date;
}

/**
 * Component entity for database (Prisma)
 */
export interface ComponentEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  promptContent: string;
  previewImageUrl: string | null;
  previewCode: string | null;
  tags: string[];
  copyCount: number;
  createdAt: Date;
}

/**
 * Query params for listing components
 */
export interface GetComponentsParams {
  category?: string;
  search?: string;
  tier?: 'free' | 'paid';
  page?: number;
  limit?: number;
}
