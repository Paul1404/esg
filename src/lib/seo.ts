import type { TemplateId } from './types';

export const SITE_NAME = 'ESG';
export const SITE_TAGLINE = 'Free Email Signature Generator';
export const SITE_TITLE = 'Free Email Signature Generator for Outlook, Gmail, Apple Mail';
export const SITE_DESCRIPTION =
  'Free email signature generator. Build HTML signatures that render correctly in Outlook, Gmail, Apple Mail, and dark mode. No login. Eleven templates. Open source.';

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    process.env.RAILWAY_PUBLIC_DOMAIN?.trim();

  if (!raw) return 'http://localhost:3000';

  const stripped = raw.replace(/\/$/, '');
  if (/^https?:\/\//i.test(stripped)) return stripped;
  if (stripped.startsWith('//')) return `https:${stripped}`;
  return `https://${stripped}`;
}

export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl()}${normalized}`;
}

export type TemplateSeo = {
  id: TemplateId;
  name: string;
  slug: string;
  title: string;
  description: string;
  intro: string;
  bestFor: string[];
  highlights: string[];
  keywords: string[];
};

export const TEMPLATE_SEO: TemplateSeo[] = [
  {
    id: 'modern',
    name: 'Modern',
    slug: 'modern',
    title: 'Modern Email Signature Template',
    description:
      'Create a modern HTML email signature with a photo, accent bar, social links, and cross-client Outlook and Gmail-safe markup.',
    intro:
      'A polished profile-first layout for teams that want a contemporary signature without risking broken email-client rendering.',
    bestFor: ['Sales teams', 'Founders', 'Consultants', 'Customer-facing teams'],
    highlights: ['Photo-led layout', 'Accent color bar', 'Social icon row', 'Rich text and HTML export'],
    keywords: ['modern email signature template', 'modern HTML email signature', 'Outlook signature template'],
  },
  {
    id: 'classic',
    name: 'Classic',
    slug: 'classic',
    title: 'Classic Email Signature Template',
    description:
      'Build a classic two-column email signature with a vertical divider, contact details, and reliable HTML for Outlook, Gmail, and Apple Mail.',
    intro:
      'A balanced business signature with enough structure for detailed contact information while staying compact in long email threads.',
    bestFor: ['Corporate teams', 'Account managers', 'Legal teams', 'Professional services'],
    highlights: ['Two-column table layout', 'Vertical divider', 'Full contact block', 'Outlook-safe spacing'],
    keywords: ['classic email signature template', 'business email signature', 'corporate Outlook signature'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    slug: 'minimal',
    title: 'Minimal Email Signature Template',
    description:
      'Generate a minimal email signature with clean typography, compact contact details, and no image dependency.',
    intro:
      'A lightweight signature for people who want a crisp identity block that keeps emails readable and avoids image-blocking issues.',
    bestFor: ['Developers', 'Writers', 'Internal teams', 'Plain-text-heavy workflows'],
    highlights: ['No graphics required', 'Small HTML footprint', 'Simple contact hierarchy', 'Dark mode aware colors'],
    keywords: ['minimal email signature template', 'simple email signature', 'no image email signature'],
  },
  {
    id: 'corporate',
    name: 'Corporate',
    slug: 'corporate',
    title: 'Corporate Email Signature Template',
    description:
      'Create a corporate email signature with logo support, full contact rows, disclaimer text, and compliant HTML email markup.',
    intro:
      'A complete company signature format for organizations that need brand consistency, legal copy, and dependable rendering.',
    bestFor: ['Enterprise teams', 'HR rollouts', 'Legal departments', 'IT-managed signatures'],
    highlights: ['Logo placement', 'Legal disclaimer area', 'Complete contact rows', 'Consistent company branding'],
    keywords: ['corporate email signature template', 'company email signature', 'legal disclaimer email signature'],
  },
  {
    id: 'creative',
    name: 'Creative',
    slug: 'creative',
    title: 'Creative Email Signature Template',
    description:
      'Design a creative email signature with color, quote support, social links, and email-client-safe HTML.',
    intro:
      'A more expressive signature for creative professionals who still need output that survives Outlook, Gmail, and mobile clients.',
    bestFor: ['Designers', 'Agencies', 'Creators', 'Marketing teams'],
    highlights: ['Colorful card style', 'Quote or tagline support', 'Social links', 'Custom accent colors'],
    keywords: ['creative email signature template', 'designer email signature', 'agency email signature'],
  },
  {
    id: 'horizontal',
    name: 'Horizontal',
    slug: 'horizontal',
    title: 'Horizontal Email Signature Template',
    description:
      'Make a compact horizontal email signature ribbon for short replies, sales emails, and mobile-friendly threads.',
    intro:
      'A single-line style signature that keeps the sender identity visible without taking over the message body.',
    bestFor: ['Short replies', 'Support teams', 'Mobile email', 'High-volume inboxes'],
    highlights: ['Ribbon-style layout', 'Compact footprint', 'Fast scanning', 'Works in rich text copy'],
    keywords: ['horizontal email signature template', 'compact email signature', 'email signature ribbon'],
  },
  {
    id: 'photo-card',
    name: 'Photo Card',
    slug: 'photo-card',
    title: 'Photo Card Email Signature Template',
    description:
      'Create a photo card email signature with a larger profile image, tinted backdrop, CTA support, and safe HTML export.',
    intro:
      'A profile-forward card layout for personal brands and relationship-driven roles where recognition matters.',
    bestFor: ['Recruiters', 'Real estate agents', 'Coaches', 'Personal brands'],
    highlights: ['Large profile photo', 'Tinted background', 'CTA button support', 'Mobile preview friendly'],
    keywords: ['photo email signature template', 'profile photo email signature', 'real estate email signature'],
  },
  {
    id: 'compact',
    name: 'Compact',
    slug: 'compact',
    title: 'Compact Email Signature Template',
    description:
      'Build a compact three-line email signature with essential contact details and efficient HTML for everyday business email.',
    intro:
      'A concise signature for teams that want a professional footer without adding visual bulk to every message.',
    bestFor: ['Operations teams', 'Internal email', 'Executives', 'Support queues'],
    highlights: ['Three-line layout', 'Low visual weight', 'Essential details only', 'Small rendered height'],
    keywords: ['compact email signature template', 'short email signature', 'small business email signature'],
  },
  {
    id: 'logo-left',
    name: 'Logo Left',
    slug: 'logo-left',
    title: 'Logo Left Email Signature Template',
    description:
      'Create an email signature with the company logo on the left, a vertical divider, and structured contact details.',
    intro:
      'A brand-first layout that puts the company mark beside the sender details while preserving reliable table-based rendering.',
    bestFor: ['Brand-led teams', 'B2B companies', 'SaaS teams', 'Partner communications'],
    highlights: ['Left-side logo', 'Structured contact block', 'Vertical divider', 'Company-first hierarchy'],
    keywords: ['logo email signature template', 'company logo email signature', 'brand email signature'],
  },
  {
    id: 'logo-bottom',
    name: 'Logo Bottom',
    slug: 'logo-bottom',
    title: 'Logo Bottom Email Signature Template',
    description:
      'Generate an email signature with contact details up top and a company logo anchored below for a clean branded footer.',
    intro:
      'A stacked branded format that keeps the sender details readable first, then reinforces the company identity below.',
    bestFor: ['Small businesses', 'Consultancies', 'Local services', 'Branded outreach'],
    highlights: ['Stacked layout', 'Bottom logo placement', 'Readable contact hierarchy', 'Good for narrow widths'],
    keywords: ['bottom logo email signature', 'branded email signature template', 'small business email signature'],
  },
  {
    id: 'centered',
    name: 'Centered',
    slug: 'centered',
    title: 'Centered Email Signature Template',
    description:
      'Design a centered email signature with a balanced layout, horizontal divider, and professional typography.',
    intro:
      'A symmetrical signature for polished personal presentation, announcements, and simple brand systems.',
    bestFor: ['Executives', 'Creators', 'Event teams', 'Independent professionals'],
    highlights: ['Centered composition', 'Horizontal divider', 'Balanced spacing', 'Clean personal branding'],
    keywords: ['centered email signature template', 'personal email signature', 'professional email signature'],
  },
];

export const TEMPLATE_SEO_BY_ID = Object.fromEntries(
  TEMPLATE_SEO.map((template) => [template.id, template]),
) as Record<TemplateId, TemplateSeo>;

export type GuideSeo = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  client: string;
  steps: string[];
  tips: string[];
  faq: { q: string; a: string }[];
  keywords: string[];
};

export const GUIDE_SEO: GuideSeo[] = [
  {
    slug: 'gmail-email-signature',
    title: 'How to Add an Email Signature in Gmail',
    description:
      'Create a free HTML email signature and add it to Gmail settings with copy-and-paste rich text. Includes logo, photo, links, and dark mode tips.',
    h1: 'How to add an email signature in Gmail',
    intro:
      'Gmail accepts formatted signatures pasted into the signature editor, but it strips style tags and can alter spacing. ESG exports compact inline HTML so the signature keeps its layout after you paste it.',
    client: 'Gmail',
    steps: [
      'Open ESG and build your signature with the Gmail preview selected.',
      'Click Copy as rich text in the export panel.',
      'In Gmail, open Settings, then See all settings.',
      'Scroll to Signature, create a new signature, and paste the copied signature.',
      'Choose the signature defaults for new emails and replies, then save changes.',
    ],
    tips: [
      'Keep the rendered width near 520 px or lower for better mobile Gmail results.',
      'Use hosted HTTPS images for logos and headshots instead of local files.',
      'Send a test email to yourself and check Gmail web plus the Gmail mobile app.',
    ],
    faq: [
      {
        q: 'Can Gmail use an HTML email signature?',
        a: 'Yes. The easiest route is to copy rich text from the generator and paste it into Gmail settings. ESG also lets you copy the raw HTML if your workflow needs it.',
      },
      {
        q: 'Why does Gmail change some email signature spacing?',
        a: 'Gmail strips style tags and rewrites parts of pasted HTML. ESG uses inline CSS and table-based spacing so the signature is less likely to break.',
      },
    ],
    keywords: ['gmail email signature', 'add email signature in gmail', 'free gmail signature generator'],
  },
  {
    slug: 'outlook-email-signature',
    title: 'How to Create an Outlook Email Signature',
    description:
      'Build a free Outlook email signature that uses table-based HTML, inline CSS, and Word-renderer-safe spacing for Outlook desktop and Microsoft 365.',
    h1: 'How to create an Outlook email signature',
    intro:
      'Outlook for Windows renders email with Microsoft Word, which means modern web layout features can fail. ESG templates use table layouts, inline styles, and Outlook-safe button markup.',
    client: 'Outlook',
    steps: [
      'Open ESG and choose an Outlook-safe template such as Classic, Corporate, or Logo Left.',
      'Fill in your contact details, logo, social links, and disclaimer.',
      'Click Copy as rich text for a normal paste workflow, or Copy HTML for managed IT rollout.',
      'In Outlook, open Signatures from Mail settings or Account settings.',
      'Paste the signature, assign it to new messages and replies, then send a test email.',
    ],
    tips: [
      'Avoid wide banners if many recipients read mail in narrow preview panes.',
      'Prefer simple font stacks like Arial, Helvetica, and Segoe UI.',
      'Use the Outlook Desktop preview before exporting.',
    ],
    faq: [
      {
        q: 'Why do Outlook signatures break more often than Gmail signatures?',
        a: 'Outlook desktop uses Microsoft Word to render HTML email. That is why ESG avoids flexbox, external CSS, and unsupported spacing patterns.',
      },
      {
        q: 'Can I use ESG for Microsoft 365 signatures?',
        a: 'Yes. Copy the rich text for an individual mailbox, or export the HTML when an admin or IT workflow needs the source markup.',
      },
    ],
    keywords: ['outlook email signature', 'Outlook signature generator', 'Microsoft 365 email signature'],
  },
  {
    slug: 'apple-mail-email-signature',
    title: 'How to Add an Email Signature in Apple Mail',
    description:
      'Make a free Apple Mail email signature with HTML formatting, hosted images, dark mode-aware colors, and copy-and-paste installation steps.',
    h1: 'How to add an email signature in Apple Mail',
    intro:
      'Apple Mail handles rich HTML signatures well, but dark mode and image handling still matter. ESG gives you a live Apple Mail preview and exports clean markup for copy-and-paste setup.',
    client: 'Apple Mail',
    steps: [
      'Build your signature in ESG and preview it in Apple Mail mode.',
      'Click Copy as rich text.',
      'Open Apple Mail, then Settings, then Signatures.',
      'Select the mailbox, create a new signature, and paste the copied signature.',
      'Choose the default signature for the account and send yourself a test email.',
    ],
    tips: [
      'Use enough contrast so auto-darkening does not make text hard to read.',
      'Host images over HTTPS so they display reliably outside your device.',
      'Check both macOS Mail and iOS Mail if you send from both devices.',
    ],
    faq: [
      {
        q: 'Does Apple Mail support HTML email signatures?',
        a: 'Yes. Apple Mail supports formatted signatures pasted into its signature settings, including links and hosted images.',
      },
      {
        q: 'Will the signature work in Apple Mail dark mode?',
        a: 'ESG templates are designed with dark mode in mind and include an Apple Mail preview, but you should still send a test email with your final colors and images.',
      },
    ],
    keywords: ['Apple Mail email signature', 'Mac Mail signature generator', 'HTML signature Apple Mail'],
  },
];
