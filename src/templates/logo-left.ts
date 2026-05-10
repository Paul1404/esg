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

export function renderLogoLeft(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted, dividerColor: divider } = d;
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';
  const rows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize, iconStyle: 'letter' }))
    .join('');
  const socialRow = renderSocialRow(d.socials, accent, 22);
  const logoScale = d.logoScale ?? 1;
  const logoMaxH = Math.round(96 * logoScale);
  const logoMaxW = Math.round(120 * logoScale);

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr>
    <td valign="middle" width="140" style="width:140px;padding:0 20px 0 0;border-right:2px solid ${accent};text-align:center;">
      ${d.logoUrl ? logoImg({ src: d.logoUrl, alt: d.company, maxHeight: logoMaxH, maxWidth: logoMaxW, style: 'margin-left:auto;margin-right:auto;' }) : `<div style="font-family:${fontFamily};font-size:${baseSize - 1}px;color:${muted};text-transform:uppercase;letter-spacing:1px;">${esc(d.company)}</div>`}
    </td>
    <td valign="middle" style="padding:0 0 0 20px;">
      <div style="font-family:${fontFamily};font-size:${baseSize + 4}px;font-weight:700;color:${text};line-height:1.2;">${esc(d.fullName)}${credentialSuffix}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${accent};line-height:1.4;font-weight:600;padding-top:2px;">${esc(d.jobTitle)}${d.department ? ` · ${esc(d.department)}` : ''}</div>
      ${d.logoUrl ? `<div style="font-family:${fontFamily};font-size:${baseSize}px;color:${text};line-height:1.4;padding-top:2px;">${esc(d.company)}</div>` : ''}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:10px;">
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
