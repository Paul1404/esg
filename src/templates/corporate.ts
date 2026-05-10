import type { SignatureData } from '@/lib/types';
import {
  buildContactRows,
  contactRowHtml,
  esc,
  escMultiline,
  img,
  logoImg,
  renderSocialRow,
  safeUrl,
  wrapSignature,
} from '@/lib/template-helpers';

export function renderCorporate(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted, dividerColor: divider } = d;
  const rows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize }))
    .join('');
  const socialRow = renderSocialRow(d.socials, accent, 24);
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';
  const logoScale = d.logoScale ?? 1;
  const logoMaxH = Math.round(48 * logoScale);
  const logoMaxW = Math.round(220 * logoScale);

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  ${d.logoUrl ? `<tr><td style="padding-bottom:12px;">${logoImg({ src: d.logoUrl, alt: d.company, maxHeight: logoMaxH, maxWidth: logoMaxW })}</td></tr>` : ''}
  <tr><td style="font-family:${fontFamily};font-size:${baseSize + 4}px;font-weight:700;color:${text};line-height:1.2;">${esc(d.fullName)}${credentialSuffix}</td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${accent};line-height:1.4;font-weight:600;padding-top:2px;">${esc(d.jobTitle)}${d.department ? ` &nbsp;|&nbsp; ${esc(d.department)}` : ''}</td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${text};line-height:1.4;padding-top:2px;">${esc(d.company)}</td></tr>
  <tr><td style="padding-top:10px;border-top:2px solid ${accent};"></td></tr>
  <tr><td style="padding-top:10px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      ${rows}
    </table>
  </td></tr>
  ${socialRow ? `<tr><td style="padding-top:12px;">${socialRow}</td></tr>` : ''}
  ${d.bannerUrl ? `<tr><td style="padding-top:14px;">${
    d.bannerLink
      ? `<a href="${safeUrl(d.bannerLink)}" target="_blank" rel="noopener" style="text-decoration:none;">${img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.2), style: 'max-width:100%;' })}</a>`
      : img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.2), style: 'max-width:100%;' })
  }</td></tr>` : ''}
  ${d.disclaimer ? `<tr><td style="padding-top:14px;border-top:1px solid ${divider};"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;padding-top:10px;">${escMultiline(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
