import type { SignatureData, SocialPlatform } from './types';

/**
 * Escape a string for safe inclusion in HTML text or attribute context.
 * Keep this conservative. Email rendering engines are unforgiving.
 */
export function esc(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Like esc(), but preserves user-entered line breaks by converting them to
 * <br>. Use for free-form multi-line fields (disclaimer, etc.) where the
 * surrounding container is a block element. Outlook ignores the CSS
 * `white-space: pre-line` workaround, so <br> is the only reliable option.
 */
export function escMultiline(input: string | undefined | null): string {
  if (!input) return '';
  return esc(String(input).replace(/\r\n?/g, '\n')).replace(/\n/g, '<br />');
}

/** Strip dangerous protocols from URLs while keeping http(s), mailto, tel. */
export function safeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(https?:|mailto:|tel:|sms:)/i.test(trimmed)) return esc(trimmed);
  // Treat schemeless as https
  if (/^[\w.-]+\.[a-z]{2}/i.test(trimmed)) return esc(`https://${trimmed}`);
  return '';
}

/**
 * Normalize an <img src>. Schemeless domain URLs ("esg.example.net/foo.png")
 * would otherwise resolve relative to the host document, and in our preview
 * iframe that document is `about:blank`, so the image 404s. Force an https://
 * prefix in that case. Protocol-relative ("//host/path") and data: URIs pass
 * through unchanged.
 */
export function normalizeImgSrc(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(https?:|data:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return trimmed;
  if (/^[\w.-]+\.[a-z]{2}/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export type SocialIconSet = Record<SocialPlatform, { label: string; baseUrl: string }>;

export const SOCIAL_META: SocialIconSet = {
  linkedin: { label: 'LinkedIn', baseUrl: 'https://linkedin.com' },
  twitter: { label: 'X', baseUrl: 'https://twitter.com' },
  github: { label: 'GitHub', baseUrl: 'https://github.com' },
  instagram: { label: 'Instagram', baseUrl: 'https://instagram.com' },
  facebook: { label: 'Facebook', baseUrl: 'https://facebook.com' },
  youtube: { label: 'YouTube', baseUrl: 'https://youtube.com' },
  website: { label: 'Website', baseUrl: '' },
  medium: { label: 'Medium', baseUrl: 'https://medium.com' },
  dribbble: { label: 'Dribbble', baseUrl: 'https://dribbble.com' },
  behance: { label: 'Behance', baseUrl: 'https://behance.net' },
};

/**
 * Inline SVG icons rendered server-side as data URIs. Many email clients
 * (Outlook, some Gmail configs) refuse to load SVG-as-image, so we render
 * platform glyphs as PNG-ready text labels with a tinted pill background
 * via colored table cells instead of icon images. This keeps signatures
 * working even when image loading is blocked.
 *
 * However we ALSO offer a coloured icon row that uses well-known PNG
 * icon CDN endpoints (Cloudflare's icon CDN style). We pre-bundle simple
 * colored SVGs as images served from a tiny built-in API route to avoid
 * external dependencies.
 */
export function socialPillCell(opts: {
  platform: SocialPlatform;
  url: string;
  bg: string;
  fg: string;
  size: number;
}): string {
  const { platform, url, bg, fg, size } = opts;
  const label = SOCIAL_META[platform].label;
  const initial = labelInitial(platform);
  const px = `${size}px`;
  const lh = `${size}px`;
  const safe = safeUrl(url);
  const cell = `
    <td align="center" valign="middle" width="${size}" height="${size}" style="width:${px};height:${px};background-color:${bg};border-radius:${Math.floor(size / 2)}px;mso-line-height-rule:exactly;line-height:${lh};text-align:center;font-family:Arial,sans-serif;font-size:${Math.floor(size * 0.55)}px;font-weight:bold;color:${fg};">
      <a href="${safe}" target="_blank" rel="noopener" style="color:${fg};text-decoration:none;display:block;width:${px};height:${px};line-height:${lh};text-align:center;" title="${esc(label)}" aria-label="${esc(label)}">${esc(initial)}</a>
    </td>`;
  return cell;
}

function labelInitial(p: SocialPlatform): string {
  switch (p) {
    case 'linkedin':
      return 'in';
    case 'twitter':
      return 'X';
    case 'github':
      return 'gh';
    case 'instagram':
      return 'ig';
    case 'facebook':
      return 'f';
    case 'youtube':
      return 'YT';
    case 'website':
      return 'www';
    case 'medium':
      return 'M';
    case 'dribbble':
      return 'Db';
    case 'behance':
      return 'Be';
  }
}

/**
 * Renders the social row as a nested table. Spacing uses an empty
 * spacer cell between pills (instead of margin) because Outlook/Word
 * ignores margin on inline-block.
 */
export function renderSocialRow(
  socials: SignatureData['socials'],
  primaryColor: string,
  size = 26,
): string {
  if (!socials || socials.length === 0) return '';
  const filtered = socials.filter((s) => s.url && s.url.trim().length > 0);
  if (filtered.length === 0) return '';
  const fg = '#ffffff';
  const cells: string[] = [];
  filtered.forEach((s, i) => {
    if (i > 0) {
      cells.push(`<td width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td>`);
    }
    cells.push(socialPillCell({ platform: s.platform, url: s.url, bg: primaryColor, fg, size }));
  });
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
      <tr>${cells.join('')}</tr>
    </table>`;
}

export type ContactRow = { label: string; value: string; href?: string };

export function buildContactRows(d: SignatureData): ContactRow[] {
  const rows: ContactRow[] = [];
  if (d.email) rows.push({ label: 'E', value: d.email, href: `mailto:${d.email}` });
  if (d.phone) rows.push({ label: 'T', value: d.phone, href: `tel:${d.phone.replace(/[^+\d]/g, '')}` });
  if (d.mobile) rows.push({ label: 'M', value: d.mobile, href: `tel:${d.mobile.replace(/[^+\d]/g, '')}` });
  if (d.website) rows.push({ label: 'W', value: d.website.replace(/^https?:\/\//, ''), href: d.website });
  if (d.address) rows.push({ label: 'A', value: d.address });
  return rows;
}

export function contactRowHtml(row: ContactRow, opts: { textColor: string; mutedColor: string; primaryColor: string; fontFamily: string; fontSize: number; iconStyle?: 'letter' | 'pill' }): string {
  const { textColor, mutedColor, primaryColor, fontFamily, fontSize, iconStyle = 'letter' } = opts;
  const valueHtml = row.href
    ? `<a href="${safeUrl(row.href)}" style="color:${textColor};text-decoration:none;">${esc(row.value)}</a>`
    : esc(row.value);

  const labelCell = iconStyle === 'pill'
    ? (() => {
        const size = Math.max(18, fontSize + 4);
        return `<td valign="middle" width="${size + 10}" style="width:${size + 10}px;padding:3px 10px 3px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr><td align="center" valign="middle" width="${size}" height="${size}" style="width:${size}px;height:${size}px;background-color:${primaryColor};border-radius:4px;mso-line-height-rule:exactly;line-height:${size}px;font-family:${fontFamily};font-size:${Math.floor(size * 0.55)}px;font-weight:700;color:#ffffff;text-align:center;">${esc(row.label)}</td></tr>
      </table>
    </td>`;
      })()
    : `<td valign="top" width="20" style="width:20px;padding:2px 8px 2px 0;font-family:${fontFamily};font-size:${fontSize - 2}px;line-height:1.4;color:${primaryColor};font-weight:700;letter-spacing:0.5px;">${esc(row.label)}</td>`;

  const valueAlign = iconStyle === 'pill' ? 'middle' : 'top';
  const valuePad = iconStyle === 'pill' ? '3px 0' : '2px 0';

  return `
    <tr>
      ${labelCell}
      <td valign="${valueAlign}" style="font-family:${fontFamily};font-size:${fontSize - 1}px;line-height:1.5;color:${mutedColor};padding:${valuePad};">${valueHtml}</td>
    </tr>`;
}

/**
 * Render a button using VML for Outlook desktop. This is the single
 * most common cross-client gotcha. Without VML the rounded button
 * collapses in Outlook 2007 to 2019 on Windows.
 */
export function renderButton(opts: {
  text: string;
  href: string;
  bg: string;
  fg: string;
  fontFamily: string;
  fontSize: number;
}): string {
  const { text, href, bg, fg, fontFamily, fontSize } = opts;
  const safe = safeUrl(href);
  return `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safe}" style="height:36px;v-text-anchor:middle;width:160px;" arcsize="16%" stroke="f" fillcolor="${bg}">
      <w:anchorlock/>
      <center style="color:${fg};font-family:${fontFamily};font-size:${fontSize}px;font-weight:bold;">${esc(text)}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-- -->
    <a href="${safe}" target="_blank" rel="noopener" style="background-color:${bg};border-radius:6px;color:${fg};display:inline-block;font-family:${fontFamily};font-size:${fontSize}px;font-weight:600;line-height:36px;text-align:center;text-decoration:none;width:160px;-webkit-text-size-adjust:none;mso-hide:all;">${esc(text)}</a>
    <!--<![endif]-->`;
}

/**
 * Wraps signature output with Outlook-specific reset rules and a width-locked
 * outer table. Returns a fragment safe to drop into an email composer or to
 * paste into Gmail's signature dialog.
 */
export function wrapSignature(opts: { width: number; inner: string; fontFamily: string; fontSize: number }): string {
  const { width, inner, fontFamily, fontSize } = opts;
  return `
<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width}" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:${width}px;max-width:100%;font-family:${fontFamily};font-size:${fontSize}px;color:#2a3140;-webkit-text-size-adjust:none;mso-line-height-rule:exactly;">
  <tr>
    <td style="padding:0;">
${inner}
    </td>
  </tr>
</table>`;
}

/**
 * Image tag with Outlook-safe defaults. Width and height are required
 * attributes (not just CSS) because Outlook ignores CSS sizes.
 */
export function img(opts: { src: string; alt: string; width: number; height: number; style?: string; round?: boolean }): string {
  const { alt, width, height, round } = opts;
  const src = normalizeImgSrc(opts.src);
  const radius = round ? `border-radius:${Math.floor(width / 2)}px;` : '';
  const style = `display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;${radius}${opts.style ?? ''}`;
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${width}" height="${height}" style="${style}" />`;
}

/**
 * Logo-shaped image: aspect-ratio preserving, bounded by a max box. Use this
 * for company logos where we don't know the source ratio (square shields,
 * wide wordmarks, etc.). Modern clients use the CSS max-width/max-height to
 * scale proportionally; Outlook desktop falls back to the attr dimensions and
 * may letterbox or stretch, which is the documented trade-off.
 */
export function logoImg(opts: { src: string; alt: string; maxHeight: number; maxWidth: number; style?: string; display?: 'block' | 'inline-block' }): string {
  const { alt, maxHeight, maxWidth, display = 'block' } = opts;
  const src = normalizeImgSrc(opts.src);
  const style = `display:${display};border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;height:auto;width:auto;max-height:${maxHeight}px;max-width:${maxWidth}px;${opts.style ?? ''}`;
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${maxWidth}" height="${maxHeight}" style="${style}" />`;
}

/**
 * Render the complimentary close line (e.g. "Best regards,") above a signature
 * block. Empty input yields empty string. Returns a <tr><td> fragment when
 * tableRow is true, otherwise a <div>.
 */
export function renderClose(opts: {
  value: string | undefined;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  tableRow?: boolean;
  paddingBottom?: number;
}): string {
  const value = (opts.value ?? '').trim();
  if (!value) return '';
  const pad = opts.paddingBottom ?? 12;
  const block = `<div style="font-family:${opts.fontFamily};font-size:${opts.fontSize}px;color:${opts.textColor};line-height:1.5;padding-bottom:${pad}px;">${escMultiline(value)}</div>`;
  if (opts.tableRow) {
    return `<tr><td style="padding:0;">${block}</td></tr>`;
  }
  return block;
}

/**
 * Render the company legal block (VAT, USt-IdNr, Handelsregister, etc.) as a
 * small muted multi-line block. Empty input yields empty string.
 */
export function renderCompanyLegal(opts: {
  value: string | undefined;
  mutedColor: string;
  dividerColor: string;
  fontFamily: string;
  fontSize: number;
  tableRow?: boolean;
  withDivider?: boolean;
}): string {
  const value = (opts.value ?? '').trim();
  if (!value) return '';
  const border = opts.withDivider ? `border-top:1px solid ${opts.dividerColor};padding-top:10px;` : '';
  const block = `<div style="font-family:${opts.fontFamily};font-size:${Math.max(10, opts.fontSize - 3)}px;color:${opts.mutedColor};line-height:1.5;${border}">${escMultiline(value)}</div>`;
  if (opts.tableRow) {
    return `<tr><td style="padding-top:10px;">${block}</td></tr>`;
  }
  return block;
}

/**
 * Build a plain-text fallback signature for clients that strip HTML
 * (or for users to paste into terminals/Slack).
 */
export function buildPlainText(d: SignatureData): string {
  const lines: string[] = [];
  if (d.complimentaryClose) {
    lines.push(d.complimentaryClose);
    lines.push('');
  }
  const titleLine = [d.fullName, d.credentials].filter(Boolean).join(', ');
  lines.push(titleLine);
  const role = [d.jobTitle, d.department].filter(Boolean).join(' · ');
  if (role) lines.push(role);
  if (d.company) lines.push(d.company);
  lines.push('');
  if (d.email) lines.push(`E: ${d.email}`);
  if (d.phone) lines.push(`T: ${d.phone}`);
  if (d.mobile) lines.push(`M: ${d.mobile}`);
  if (d.website) lines.push(`W: ${d.website}`);
  if (d.address) lines.push(`A: ${d.address}`);
  if (d.socials.length) {
    lines.push('');
    d.socials.filter((s) => s.url).forEach((s) => {
      lines.push(`${SOCIAL_META[s.platform].label}: ${s.url}`);
    });
  }
  if (d.companyLegal) {
    lines.push('');
    lines.push(d.companyLegal);
  }
  if (d.disclaimer) {
    lines.push('');
    lines.push(d.disclaimer);
  }
  return lines.join('\n');
}

/**
 * Build a vCard 3.0 string for the signature subject. Useful as an
 * attachment download.
 */
export function buildVCard(d: SignatureData): string {
  const nameParts = d.fullName.trim().split(/\s+/);
  const family = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';
  const given = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${family};${given};;;`,
    `FN:${d.fullName}`,
    d.company ? `ORG:${d.company}${d.department ? ';' + d.department : ''}` : '',
    d.jobTitle ? `TITLE:${d.jobTitle}` : '',
    d.email ? `EMAIL;TYPE=INTERNET,WORK:${d.email}` : '',
    d.phone ? `TEL;TYPE=WORK,VOICE:${d.phone}` : '',
    d.mobile ? `TEL;TYPE=CELL,VOICE:${d.mobile}` : '',
    d.website ? `URL:${d.website}` : '',
    d.address ? `ADR;TYPE=WORK:;;${d.address};;;;` : '',
    ...d.socials
      .filter((s) => s.url)
      .map((s) => `URL;TYPE=${s.platform.toUpperCase()}:${s.url}`),
    d.companyLegal ? `NOTE:${d.companyLegal.replace(/\r?\n/g, '\\n')}` : '',
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\r\n') + '\r\n';
}
