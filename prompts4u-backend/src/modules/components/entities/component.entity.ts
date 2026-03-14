export class ComponentEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tier: 'free' | 'paid';
  promptContent: string;
  previewImageUrl?: string;
  previewCode?: string;
  tags: string[];
  copyCount: number;
  createdAt: Date;
}
