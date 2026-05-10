import type { SignatureData } from '@/lib/types';
import {
  esc,
  escMultiline,
  logoImg,
  renderCompanyLegal,
  renderSocialRow,
  safeUrl,
  wrapSignature,
} from '@/lib/template-helpers';

export function renderCentered(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted, dividerColor: divider } = d;
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';
  const socialRow = renderSocialRow(d.socials, accent, 24);
  const logoScale = d.logoScale ?? 1;
  const logoMaxH = Math.round(48 * logoScale);
  const logoMaxW = Math.round(220 * logoScale);

  const contactPieces: string[] = [];
  if (d.email) contactPieces.push(`<a href="mailto:${esc(d.email)}" style="color:${text};text-decoration:none;">${esc(d.email)}</a>`);
  if (d.phone) contactPieces.push(`<a href="tel:${esc(d.phone.replace(/[^+\d]/g, ''))}" style="color:${text};text-decoration:none;">${esc(d.phone)}</a>`);
  if (d.mobile) contactPieces.push(`<a href="tel:${esc(d.mobile.replace(/[^+\d]/g, ''))}" style="color:${text};text-decoration:none;">${esc(d.mobile)}</a>`);
  if (d.website) contactPieces.push(`<a href="${safeUrl(d.website)}" target="_blank" rel="noopener" style="color:${accent};text-decoration:none;">${esc(d.website.replace(/^https?:\/\//, ''))}</a>`);
  if (d.address) contactPieces.push(`<span style="color:${muted};">${esc(d.address)}</span>`);

  const close = d.complimentaryClose
    ? `<tr><td align="center" style="padding-bottom:12px;font-family:${fontFamily};font-size:${baseSize}px;color:${text};line-height:1.5;text-align:center;">${esc(d.complimentaryClose)}</td></tr>`
    : '';
  const legal = renderCompanyLegal({ value: d.companyLegal, mutedColor: muted, dividerColor: divider, fontFamily, fontSize: baseSize });

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  ${close}
  ${d.logoUrl ? `<tr><td align="center" style="padding-bottom:12px;"><div style="text-align:center;">${logoImg({ src: d.logoUrl, alt: d.company, maxHeight: logoMaxH, maxWidth: logoMaxW, style: 'margin-left:auto;margin-right:auto;' })}</div></td></tr>` : ''}
  <tr><td align="center" style="font-family:${fontFamily};font-size:${baseSize + 5}px;font-weight:700;color:${text};line-height:1.2;text-align:center;text-transform:uppercase;letter-spacing:1px;">${esc(d.fullName)}${credentialSuffix}</td></tr>
  <tr><td align="center" style="font-family:${fontFamily};font-size:${baseSize}px;color:${accent};line-height:1.4;font-weight:600;padding-top:4px;text-align:center;">${esc(d.jobTitle)}</td></tr>
  ${d.company ? `<tr><td align="center" style="font-family:${fontFamily};font-size:${baseSize - 1}px;color:${muted};line-height:1.4;padding-top:2px;text-align:center;">${esc(d.company)}${d.department ? ` · ${esc(d.department)}` : ''}</td></tr>` : ''}
  <tr><td align="center" style="padding:12px 0 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
      <tr><td width="60" height="1" style="width:60px;height:1px;background-color:${divider};font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding-top:12px;font-family:${fontFamily};font-size:${baseSize - 1}px;color:${muted};line-height:1.6;text-align:center;">${contactPieces.join(' &nbsp;·&nbsp; ')}</td></tr>
  ${socialRow ? `<tr><td align="center" style="padding-top:12px;"><div style="display:inline-block;">${socialRow}</div></td></tr>` : ''}
  ${d.bannerUrl ? `<tr><td align="center" style="padding-top:14px;">${
    d.bannerLink
      ? `<a href="${safeUrl(d.bannerLink)}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;"><img src="${esc(d.bannerUrl)}" alt="Banner" width="${d.layoutWidth}" height="${Math.round(d.layoutWidth * 0.18)}" style="display:block;border:0;outline:none;max-width:100%;" /></a>`
      : `<img src="${esc(d.bannerUrl)}" alt="Banner" width="${d.layoutWidth}" height="${Math.round(d.layoutWidth * 0.18)}" style="display:block;border:0;outline:none;max-width:100%;margin-left:auto;margin-right:auto;" />`
  }</td></tr>` : ''}
  ${d.companyLegal ? `<tr><td align="center" style="padding-top:14px;"><div style="text-align:center;">${legal}</div></td></tr>` : ''}
  ${d.disclaimer ? `<tr><td align="center" style="padding-top:14px;"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;text-align:center;">${escMultiline(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
