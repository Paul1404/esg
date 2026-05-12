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

export function renderLogoBottom(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted, dividerColor: divider } = d;
  const layout = resolveLayout(d);
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';
  const rows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize, iconStyle: 'pill' }))
    .join('');
  const socialRow = renderSocialRow(d.socials, accent, 22);
  const logoScale = d.logoScale ?? 1;
  const logoMaxH = Math.round(40 * logoScale);
  const logoMaxW = Math.round(160 * logoScale);

  const close = renderClose({ value: d.complimentaryClose, textColor: text, fontFamily, fontSize: baseSize, tableRow: true });
  const legal = renderCompanyLegal({ value: d.companyLegal, mutedColor: muted, dividerColor: divider, fontFamily, fontSize: baseSize, tableRow: true });

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  ${close}
  <tr><td style="font-family:${fontFamily};font-size:${baseSize + 4}px;font-weight:700;color:${text};line-height:1.2;text-transform:uppercase;letter-spacing:0.5px;">${esc(d.fullName)}${credentialSuffix}</td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${accent};line-height:1.4;font-weight:600;padding-top:3px;">${esc(d.jobTitle)}${d.department ? ` · ${esc(d.department)}` : ''}</td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.4;padding-top:1px;">${esc(d.company)}</td></tr>
  <tr><td style="padding:12px 0 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      ${rows}
    </table>
  </td></tr>
  ${d.logoUrl || socialRow ? `<tr><td data-esg-region="brandbar" style="padding:${layout.gap}px 0 0 0;${layout.sectionDividers ? `border-top:1px solid ${divider};` : ''}">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin-top:${layout.gap}px;">
      <tr>
        <td valign="middle" style="padding-top:${layout.gap}px;">
          ${d.logoUrl ? logoImg({ src: d.logoUrl, alt: d.company, maxHeight: logoMaxH, maxWidth: logoMaxW }) : ''}
        </td>
        ${socialRow ? `<td valign="middle" align="right" style="padding-top:${layout.gap}px;">${socialRow}</td>` : ''}
      </tr>
    </table>
  </td></tr>` : ''}
  ${d.bannerUrl ? `<tr><td data-esg-region="banner" style="padding:${layout.gap}px 0 0 0;">${
    d.bannerLink
      ? `<a href="${safeUrl(d.bannerLink)}" target="_blank" rel="noopener" style="text-decoration:none;">${img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.18), style: 'max-width:100%;' })}</a>`
      : img({ src: d.bannerUrl, alt: 'Banner', width: d.layoutWidth, height: Math.round(d.layoutWidth * 0.18), style: 'max-width:100%;' })
  }</td></tr>` : ''}
  ${legal}
  ${d.disclaimer ? `<tr><td data-esg-region="disclaimer" style="padding:${layout.gap}px 0 0 0;"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;">${escMultiline(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
