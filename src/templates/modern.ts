import type { SignatureData } from '@/lib/types';
import {
  buildContactRows,
  contactRowHtml,
  esc,
  escMultiline,
  img,
  logoImg,
  renderButton,
  renderSocialRow,
  safeUrl,
  wrapSignature,
} from '@/lib/template-helpers';

export function renderModern(d: SignatureData): string {
  const fontFamily = d.fontFamily;
  const baseSize = d.fontSize;
  const accent = d.primaryColor;
  const text = d.textColor;
  const muted = d.mutedColor;
  const divider = d.dividerColor;

  const contactRows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize, iconStyle: 'pill' }))
    .join('');

  const photoCell = d.photoUrl
    ? `<td valign="top" width="92" style="width:92px;padding:0 18px 0 0;">
         ${img({ src: d.photoUrl, alt: d.fullName, width: 84, height: 84, round: true })}
       </td>`
    : '';

  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';
  const pronouns = d.showPronouns && d.pronouns ? ` <span style="color:${muted};font-weight:400;font-size:${baseSize - 2}px;">(${esc(d.pronouns)})</span>` : '';
  const logoScale = d.logoScale ?? 1;
  const logoMaxH = Math.round(32 * logoScale);
  const logoMaxW = Math.round(180 * logoScale);
  const logoBlock = d.logoUrl
    ? `<div style="padding-bottom:10px;">${logoImg({ src: d.logoUrl, alt: d.company, maxHeight: logoMaxH, maxWidth: logoMaxW })}</div>`
    : '';

  const cta = d.ctaText && d.ctaUrl
    ? `<tr><td style="padding:14px 0 0 0;">${renderButton({ text: d.ctaText, href: d.ctaUrl, bg: accent, fg: '#ffffff', fontFamily, fontSize: baseSize - 1 })}</td></tr>`
    : '';

  const socialRow = renderSocialRow(d.socials, accent, 26);
  const socialBlock = socialRow
    ? `<tr><td style="padding:14px 0 0 0;">${socialRow}</td></tr>`
    : '';

  const banner = d.bannerUrl
    ? `<tr><td style="padding:16px 0 0 0;">${
        d.bannerLink
          ? `<a href="${safeUrl(d.bannerLink)}" target="_blank" rel="noopener" style="text-decoration:none;">${img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.22), style: 'max-width:100%;' })}</a>`
          : img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.22), style: 'max-width:100%;' })
      }</td></tr>`
    : '';

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr>
    ${photoCell}
    <td valign="top" style="border-left:3px solid ${accent};padding:0 0 0 16px;">
      ${logoBlock}
      <div style="font-family:${fontFamily};font-size:${baseSize + 4}px;font-weight:700;color:${text};line-height:1.2;">${esc(d.fullName)}${credentialSuffix}${pronouns}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.4;padding-top:2px;">
        ${esc(d.jobTitle)}${d.department ? ` · ${esc(d.department)}` : ''}
      </div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${text};font-weight:600;line-height:1.4;padding-top:2px;">
        ${esc(d.company)}
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:10px;">
        ${contactRows}
      </table>
    </td>
  </tr>
  ${cta}
  ${socialBlock}
  ${d.quote ? `<tr><td style="padding:14px 0 0 0;border-top:1px solid ${divider};margin-top:14px;"><div style="font-family:${fontFamily};font-style:italic;color:${muted};font-size:${baseSize - 1}px;line-height:1.5;padding-top:14px;">“${esc(d.quote)}”</div></td></tr>` : ''}
  ${banner}
  ${d.disclaimer ? `<tr><td style="padding:14px 0 0 0;"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.4;">${escMultiline(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
