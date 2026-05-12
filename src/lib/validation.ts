import { z } from 'zod';

export const SocialSchema = z.object({
  platform: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/),
  url: z.string().max(500).default(''),
});

export const SignatureSchema = z.object({
  fullName: z.string().max(120).default(''),
  jobTitle: z.string().max(160).default(''),
  department: z.string().max(120).optional().default(''),
  company: z.string().max(160).default(''),
  pronouns: z.string().max(40).optional().default(''),
  credentials: z.string().max(40).optional().default(''),
  companyLegal: z.string().max(600).optional().default(''),

  email: z.string().max(200).default(''),
  phone: z.string().max(60).optional().default(''),
  mobile: z.string().max(60).optional().default(''),
  website: z.string().max(300).optional().default(''),
  address: z.string().max(300).optional().default(''),

  photoUrl: z.string().max(1000).optional().default(''),
  logoUrl: z.string().max(1000).optional().default(''),
  logoScale: z.number().min(0.5).max(4).optional().default(1),
  bannerUrl: z.string().max(1000).optional().default(''),
  bannerLink: z.string().max(1000).optional().default(''),

  socials: z.array(SocialSchema).max(10).default([]),

  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#7c5cff'),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#1f2330'),
  mutedColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6b7385'),
  dividerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#e2e5ec'),

  fontFamily: z.string().max(200).default("Helvetica, Arial, sans-serif"),
  fontSize: z.number().int().min(10).max(20).default(14),
  layoutWidth: z.number().int().min(360).max(720).default(520),

  ctaText: z.string().max(40).optional().default(''),
  ctaUrl: z.string().max(500).optional().default(''),
  quote: z.string().max(280).optional().default(''),
  disclaimer: z.string().max(2000).optional().default(''),
  complimentaryClose: z.string().max(80).optional().default(''),
  showPronouns: z.boolean().optional().default(true),

  showVerticalDivider: z.boolean().optional().default(true),
  showSectionDividers: z.boolean().optional().default(true),
  sectionSpacing: z.number().int().min(0).max(40).optional().default(14),
});

export const TemplateIdSchema = z.enum([
  'classic', 'modern', 'minimal', 'corporate',
  'creative', 'horizontal', 'photo-card', 'compact',
  'logo-left', 'logo-bottom', 'centered',
]);

export const SaveSignaturePayload = z.object({
  name: z.string().min(1).max(120),
  template: TemplateIdSchema,
  data: SignatureSchema,
});
