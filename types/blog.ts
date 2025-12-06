// Blog post types

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  title_en?: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  views: number;
  reading_time: number; // in minutes
}

export interface BlogCategory {
  id: string;
  name: string;
  name_en: string;
  slug: string;
}

// Default categories for land-related content
export const BLOG_CATEGORIES = [
  { id: '1', name: 'জমি যাচাই', name_en: 'Land Verification', slug: 'land-verification' },
  { id: '2', name: 'দলিল গাইড', name_en: 'Deed Guide', slug: 'deed-guide' },
  { id: '3', name: 'আইনি পরামর্শ', name_en: 'Legal Advice', slug: 'legal-advice' },
  { id: '4', name: 'মামলা ও বিরোধ', name_en: 'Cases & Disputes', slug: 'cases-disputes' },
  { id: '5', name: 'সরকারি সেবা', name_en: 'Government Services', slug: 'govt-services' },
];

