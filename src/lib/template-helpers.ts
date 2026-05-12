import type { SignatureData, SocialPlatform } from './types';
import { BRAND_BY_SLUG, CONTACT_ICONS, svgIconDataUri } from './icons';

/**
 * Resolved layout knobs with safe defaults. Templates should call this once
 * and then use the returned values everywhere they would have hardcoded gaps
 * or divider rules. Keeps preview-time tweaks (and HTML export) in sync.
 */
export type ResolvedLayout = {
  gap: number;
  verticalDivider: boolean;
  sectionDividers: boolean;
};

export function resolveLayout(d: SignatureData): ResolvedLayout {
  return {
    gap: typeof d.sectionSpacing === 'number' ? clamp(d.sectionSpacing, 0, 40) : 14,
    verticalDivider: d.showVerticalDivider !== false,
    sectionDividers: d.showSectionDividers !== false,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

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

export type SocialMeta = { label: string; baseUrl: string };

/**
 * Look up display metadata for a social platform. Falls back to a "Website"
 * label and no base URL hint for unknown slugs so legacy data and free-form
 * picks from the icon search still render sensibly.
 */
export function socialMeta(platform: SocialPlatform): SocialMeta {
  const icon = BRAND_BY_SLUG[platform];
  if (!icon) return { label: platform || 'Website', baseUrl: '' };
  return { label: icon.name, baseUrl: icon.baseUrl ?? '' };
}

/**
 * @deprecated Kept for backwards compatibility with older imports. New code
 * should call `socialMeta(slug)` so it can handle the broader icon library
 * without enumerating every platform up front.
 */
export const SOCIAL_META = new Proxy({} as Record<string, SocialMeta>, {
  get(_t, p: string) {
    return socialMeta(p);
  },
});

/**
 * Render a single social pill as a table cell: a coloured circle with a white
 * SVG glyph at its centre. The glyph is embedded as a URL-encoded data URI
 * so it ships without external requests; modern Gmail, Outlook 365, and Apple
 * Mail render it correctly. Clients that strip data URIs still see the
 * coloured background, which keeps the row visually intentional.
 */
export function socialPillCell(opts: {
  platform: SocialPlatform;
  url: string;
  bg: string;
  fg: string;
  size: number;
}): string {
  const { platform, url, bg, fg, size } = opts;
  const meta = socialMeta(platform);
  const icon = BRAND_BY_SLUG[platform] ?? BRAND_BY_SLUG['website'];
  const px = `${size}px`;
  const lh = `${size}px`;
  const safe = safeUrl(url);
  const glyph = Math.max(10, Math.round(size * 0.55));
  const iconSrc = svgIconDataUri(icon.path, fg);
  const cell = `
    <td align="center" valign="middle" width="${size}" height="${size}" style="width:${px};height:${px};background-color:${bg};border-radius:${Math.floor(size / 2)}px;mso-line-height-rule:exactly;line-height:${lh};font-size:0;text-align:center;">
      <a href="${safe}" target="_blank" rel="noopener" style="display:inline-block;vertical-align:middle;color:${fg};text-decoration:none;line-height:0;font-size:0;" title="${esc(meta.label)}" aria-label="${esc(meta.label)}"><img src="${iconSrc}" alt="${esc(meta.label)}" width="${glyph}" height="${glyph}" style="display:block;border:0;width:${glyph}px;height:${glyph}px;" /></a>
    </td>`;
  return cell;
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

export type ContactKind = 'email' | 'phone' | 'mobile' | 'website' | 'address';
export type ContactRow = { kind: ContactKind; label: string; value: string; href?: string };

/**
 * Turn a free-form address into a Google Maps "search" URL. We use the
 * `?q=` form rather than `?api=1&query=` so it works on both the web app
 * and the native Google Maps apps on iOS / Android without an API key.
 */
export function mapsHrefForAddress(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function buildContactRows(d: SignatureData): ContactRow[] {
  const rows: ContactRow[] = [];
  if (d.email) rows.push({ kind: 'email', label: 'E', value: d.email, href: `mailto:${d.email}` });
  if (d.phone) rows.push({ kind: 'phone', label: 'T', value: d.phone, href: `tel:${d.phone.replace(/[^+\d]/g, '')}` });
  if (d.mobile) rows.push({ kind: 'mobile', label: 'M', value: d.mobile, href: `tel:${d.mobile.replace(/[^+\d]/g, '')}` });
  if (d.website) rows.push({ kind: 'website', label: 'W', value: d.website.replace(/^https?:\/\//, ''), href: d.website });
  if (d.address) rows.push({ kind: 'address', label: 'A', value: d.address, href: mapsHrefForAddress(d.address) });
  return rows;
}

function contactIconPathFor(kind: ContactKind): string {
  switch (kind) {
    case 'email': return CONTACT_ICONS.email;
    case 'phone': return CONTACT_ICONS.phone;
    case 'mobile': return CONTACT_ICONS.mobile;
    case 'website': return CONTACT_ICONS.globe;
    case 'address': return CONTACT_ICONS.pin;
  }
}

/**
 * Render one contact line as a table row. Layouts are vertically locked: the
 * icon cell and the value cell share `valign="middle"` and matching line
 * heights so the glyph centres on the cap-line of the value text. This is
 * what fixes the "W is slightly above the website text" misalignment.
 *
 * `iconStyle: 'pill'` draws the icon white-on-accent inside a rounded square.
 * `iconStyle: 'letter'` (or default `'icon'`) draws the icon accent-coloured
 * with no background, suitable for plainer templates.
 */
export function contactRowHtml(row: ContactRow, opts: {
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  iconStyle?: 'letter' | 'pill' | 'icon';
}): string {
  const { textColor, mutedColor, primaryColor, fontFamily, fontSize, iconStyle = 'icon' } = opts;
  const valueHtml = row.href
    ? `<a href="${safeUrl(row.href)}" style="color:${textColor};text-decoration:none;">${esc(row.value)}</a>`
    : esc(row.value);
  const path = contactIconPathFor(row.kind);

  let labelCell: string;
  if (iconStyle === 'pill') {
    const size = Math.max(18, fontSize + 4);
    const glyph = Math.max(10, Math.round(size * 0.6));
    const iconSrc = svgIconDataUri(path, '#ffffff');
    labelCell = `<td valign="middle" width="${size + 10}" style="width:${size + 10}px;padding:0 10px 0 0;line-height:${fontSize + 6}px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;display:inline-table;vertical-align:middle;">
        <tr><td align="center" valign="middle" width="${size}" height="${size}" style="width:${size}px;height:${size}px;background-color:${primaryColor};border-radius:4px;mso-line-height-rule:exactly;line-height:${size}px;text-align:center;"><img src="${iconSrc}" alt="${esc(row.label)}" width="${glyph}" height="${glyph}" style="display:inline-block;vertical-align:middle;border:0;width:${glyph}px;height:${glyph}px;" /></td></tr>
      </table>
    </td>`;
  } else {
    const glyph = fontSize + 2;
    const iconSrc = svgIconDataUri(path, primaryColor);
    labelCell = `<td valign="middle" width="${glyph + 8}" style="width:${glyph + 8}px;padding:0 8px 0 0;line-height:${fontSize + 6}px;"><img src="${iconSrc}" alt="${esc(row.label)}" width="${glyph}" height="${glyph}" style="display:inline-block;vertical-align:middle;border:0;width:${glyph}px;height:${glyph}px;" /></td>`;
  }

  return `
    <tr>
      ${labelCell}
      <td valign="middle" style="font-family:${fontFamily};font-size:${fontSize - 1}px;line-height:${fontSize + 6}px;color:${mutedColor};padding:3px 0;">${valueHtml}</td>
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
      lines.push(`${socialMeta(s.platform).label}: ${s.url}`);
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
