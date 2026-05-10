import type { SignatureData } from '@/lib/types';
import {
  buildContactRows,
  contactRowHtml,
  esc,
  escMultiline,
  img,
  renderSocialRow,
  safeUrl,
  wrapSignature,
} from '@/lib/template-helpers';

export function renderClassic(d: SignatureData): string {
  const fontFamily = d.fontFamily;
  const baseSize = d.fontSize;
  const accent = d.primaryColor;
  const text = d.textColor;
  const muted = d.mutedColor;
  const divider = d.dividerColor;

  const rows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize }))
    .join('');

  const socialRow = renderSocialRow(d.socials, accent, 22);
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr>
    <td valign="top" style="padding:0 18px 0 0;border-right:1px solid ${divider};">
      <div style="font-family:${fontFamily};font-size:${baseSize + 3}px;font-weight:700;color:${text};line-height:1.2;">${esc(d.fullName)}${credentialSuffix}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.5;padding-top:3px;">${esc(d.jobTitle)}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${text};font-weight:600;line-height:1.5;padding-top:3px;">${esc(d.company)}</div>
      ${d.logoUrl ? `<div style="padding-top:10px;">${img({ src: d.logoUrl, alt: d.company, width: 110, height: 36, style: 'object-fit:contain;' })}</div>` : ''}
    </td>
    <td valign="top" style="padding:0 0 0 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rows}
      </table>
      ${socialRow ? `<div style="padding-top:10px;">${socialRow}</div>` : ''}
    </td>
  </tr>
  ${d.bannerUrl ? `<tr><td colspan="2" style="padding:14px 0 0 0;">${
    d.bannerLink
      ? `<a href="${safeUrl(d.bannerLink)}" target="_blank" rel="noopener" style="text-decoration:none;">${img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.18), style: 'max-width:100%;' })}</a>`
      : img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.18), style: 'max-width:100%;' })
  }</td></tr>` : ''}
  ${d.disclaimer ? `<tr><td colspan="2" style="padding:14px 0 0 0;border-top:1px solid ${divider};"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;padding-top:10px;">${escMultiline(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
