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
  companyLegal?: string;

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

  // Complimentary close (e.g. "Best regards,")
  complimentaryClose?: string;

  // Misc
  showPronouns?: boolean;
};

export const COMPLIMENTARY_CLOSE_PRESETS: { label: string; value: string }[] = [
  { label: 'None', value: '' },
  { label: 'Best regards,', value: 'Best regards,' },
  { label: 'Kind regards,', value: 'Kind regards,' },
  { label: 'Warm regards,', value: 'Warm regards,' },
  { label: 'Sincerely,', value: 'Sincerely,' },
  { label: 'Thanks,', value: 'Thanks,' },
  { label: 'Thank you,', value: 'Thank you,' },
  { label: 'Cheers,', value: 'Cheers,' },
  { label: 'All the best,', value: 'All the best,' },
  { label: 'Talk soon,', value: 'Talk soon,' },
  { label: 'Mit freundlichen Grüßen,', value: 'Mit freundlichen Grüßen,' },
  { label: 'Viele Grüße,', value: 'Viele Grüße,' },
  { label: 'Beste Grüße,', value: 'Beste Grüße,' },
  { label: 'Herzliche Grüße,', value: 'Herzliche Grüße,' },
  { label: 'Cordialement,', value: 'Cordialement,' },
  { label: 'Bien à vous,', value: 'Bien à vous,' },
  { label: 'Saludos cordiales,', value: 'Saludos cordiales,' },
];

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
  companyLegal: '',
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
  primaryColor: '#6e54e0',
  textColor: '#2a3140',
  mutedColor: '#6b7280',
  dividerColor: '#e5e7eb',
  fontFamily: DEFAULT_FONT,
  fontSize: 14,
  layoutWidth: 520,
  ctaText: 'Book a meeting',
  ctaUrl: 'https://cal.com/jamie',
  quote: 'Make it useful. Make it kind.',
  disclaimer: '',
  complimentaryClose: '',
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
