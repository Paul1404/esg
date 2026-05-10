export type SocialPlatform =
  | 'linkedin'
  | 'twitter'
  | 'github'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'website'
  | 'medium'
  | 'dribbble'
  | 'behance';

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export type SignatureData = {
  // Identity
  fullName: string;
  jobTitle: string;
  department?: string;
  company: string;
  pronouns?: string;
  credentials?: string;

  // Contact
  email: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;

  // Visuals
  photoUrl?: string;
  logoUrl?: string;
  logoScale?: number;
  bannerUrl?: string;
  bannerLink?: string;

  // Social
  socials: SocialLink[];

  // Style
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  dividerColor: string;
  fontFamily: string;
  fontSize: number;
  layoutWidth: number;

  // CTA
  ctaText?: string;
  ctaUrl?: string;

  // Quote / tagline
  quote?: string;

  // Disclaimer
  disclaimer?: string;

  // Misc
  showPronouns?: boolean;
};

export type TemplateId =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'corporate'
  | 'creative'
  | 'horizontal'
  | 'photo-card'
  | 'compact'
  | 'logo-left'
  | 'logo-bottom'
  | 'centered';

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  description: string;
};

export const DEFAULT_FONT =
  "Helvetica, Arial, 'Segoe UI', Roboto, sans-serif";

export const DEFAULT_SIGNATURE: SignatureData = {
  fullName: 'Jamie Rivers',
  jobTitle: 'Senior Product Designer',
  department: 'Design',
  company: 'Northwind Labs',
  pronouns: 'they/them',
  credentials: '',
  email: 'jamie@northwind.example',
  phone: '+1 (555) 010-2233',
  mobile: '',
  website: 'https://northwind.example',
  address: '500 Mission St, San Francisco, CA',
  photoUrl: '',
  logoUrl: '',
  logoScale: 1,
  bannerUrl: '',
  bannerLink: '',
  socials: [
    { platform: 'linkedin', url: 'https://linkedin.com/in/jamie' },
    { platform: 'twitter', url: 'https://twitter.com/jamie' },
    { platform: 'github', url: 'https://github.com/jamie' },
  ],
  primaryColor: '#7c5cff',
  textColor: '#1f2330',
  mutedColor: '#6b7385',
  dividerColor: '#e2e5ec',
  fontFamily: DEFAULT_FONT,
  fontSize: 14,
  layoutWidth: 520,
  ctaText: 'Book a meeting',
  ctaUrl: 'https://cal.com/jamie',
  quote: 'Make it useful. Make it kind.',
  disclaimer: '',
  showPronouns: true,
};

export const TEMPLATE_LIST: TemplateMeta[] = [
  { id: 'modern', name: 'Modern', description: 'Photo + accent bar + social row' },
  { id: 'classic', name: 'Classic', description: 'Two-column with vertical divider' },
  { id: 'minimal', name: 'Minimal', description: 'Single column, no graphics' },
  { id: 'corporate', name: 'Corporate', description: 'Logo, full contact, disclaimer' },
  { id: 'creative', name: 'Creative', description: 'Colorful card with quote' },
  { id: 'horizontal', name: 'Horizontal', description: 'Inline single-line ribbon' },
  { id: 'photo-card', name: 'Photo Card', description: 'Large photo + tinted backdrop' },
  { id: 'compact', name: 'Compact', description: 'Tight three-line layout' },
  { id: 'logo-left', name: 'Logo Left', description: 'Logo as left brand mark + vertical divider' },
  { id: 'logo-bottom', name: 'Logo Bottom', description: 'Content on top, logo anchored below' },
  { id: 'centered', name: 'Centered', description: 'Centered layout with horizontal divider' },
];
