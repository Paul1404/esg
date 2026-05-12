import type { SignatureData } from '@/lib/types';
import {
  buildContactRows,
  contactRowHtml,
  esc,
  escMultiline,
  img,
  logoImg,
  renderClose,
  renderCompanyLegal,
  renderSocialRow,
  resolveLayout,
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
  const layout = resolveLayout(d);

  const rows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize }))
    .join('');

  const socialRow = renderSocialRow(d.socials, accent, 22);
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';
  const logoScale = d.logoScale ?? 1;
  const logoMaxH = Math.round(40 * logoScale);
  const logoMaxW = Math.round(160 * logoScale);

  const close = renderClose({ value: d.complimentaryClose, textColor: text, fontFamily, fontSize: baseSize });
  const legal = renderCompanyLegal({ value: d.companyLegal, mutedColor: muted, dividerColor: divider, fontFamily, fontSize: baseSize, withDivider: !d.disclaimer && layout.sectionDividers });
  const vRule = layout.verticalDivider ? `border-right:1px solid ${divider};` : '';
  const hRule = layout.sectionDividers ? `border-top:1px solid ${divider};` : '';

  const inner = `
${close}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr>
    <td data-esg-region="col-left" valign="top" style="padding:0 18px 0 0;${vRule}">
      <div style="font-family:${fontFamily};font-size:${baseSize + 3}px;font-weight:700;color:${text};line-height:1.2;">${esc(d.fullName)}${credentialSuffix}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.5;padding-top:3px;">${esc(d.jobTitle)}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${text};font-weight:600;line-height:1.5;padding-top:3px;">${esc(d.company)}</div>
      ${d.logoUrl ? `<div style="padding-top:10px;">${logoImg({ src: d.logoUrl, alt: d.company, maxHeight: logoMaxH, maxWidth: logoMaxW })}</div>` : ''}
    </td>
    <td data-esg-region="col-right" valign="top" style="padding:0 0 0 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rows}
      </table>
      ${socialRow ? `<div style="padding-top:10px;">${socialRow}</div>` : ''}
    </td>
  </tr>
  ${d.bannerUrl ? `<tr><td data-esg-region="banner" colspan="2" style="padding:${layout.gap}px 0 0 0;">${
    d.bannerLink
      ? `<a href="${safeUrl(d.bannerLink)}" target="_blank" rel="noopener" style="text-decoration:none;">${img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.18), style: 'max-width:100%;' })}</a>`
      : img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.18), style: 'max-width:100%;' })
  }</td></tr>` : ''}
  ${d.companyLegal ? `<tr><td data-esg-region="legal" colspan="2" style="padding:${layout.gap}px 0 0 0;${!d.disclaimer && layout.sectionDividers ? `border-top:1px solid ${divider};` : ''}">${legal}</td></tr>` : ''}
  ${d.disclaimer ? `<tr><td data-esg-region="disclaimer" colspan="2" style="padding:${layout.gap}px 0 0 0;${hRule}"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;padding-top:10px;">${escMultiline(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
