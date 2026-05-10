import type { SignatureData } from '@/lib/types';
import {
  buildContactRows,
  contactRowHtml,
  esc,
  img,
  renderButton,
  renderSocialRow,
  wrapSignature,
} from '@/lib/template-helpers';

export function renderCreative(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted } = d;
  const rows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize }))
    .join('');
  const socialRow = renderSocialRow(d.socials, '#ffffff', 24);
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';

  const cta = d.ctaText && d.ctaUrl
    ? `<tr><td style="padding-top:14px;">${renderButton({ text: d.ctaText, href: d.ctaUrl, bg: '#ffffff', fg: accent, fontFamily, fontSize: baseSize - 1 })}</td></tr>`
    : '';

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr>
    <td bgcolor="${accent}" style="background-color:${accent};padding:18px 22px;border-radius:10px 10px 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          ${d.photoUrl ? `<td valign="top" width="80" style="width:80px;padding-right:14px;">${img({ src: d.photoUrl, alt: d.fullName, width: 72, height: 72, round: true, style: 'border:3px solid #ffffff;' })}</td>` : ''}
          <td valign="middle">
            <div style="font-family:${fontFamily};font-size:${baseSize + 5}px;font-weight:800;color:#ffffff;line-height:1.15;">${esc(d.fullName)}${credentialSuffix}</div>
            <div style="font-family:${fontFamily};font-size:${baseSize}px;color:rgba(255,255,255,0.9);line-height:1.4;padding-top:4px;">${esc(d.jobTitle)}${d.company ? ` @ ${esc(d.company)}` : ''}</div>
            ${socialRow ? `<div style="padding-top:10px;">${socialRow}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 22px;background-color:#ffffff;border:1px solid ${d.dividerColor};border-top:0;border-radius:0 0 10px 10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rows}
      </table>
      ${d.quote ? `<div style="font-family:${fontFamily};font-style:italic;color:${muted};font-size:${baseSize - 1}px;line-height:1.5;padding-top:12px;border-top:1px dashed ${d.dividerColor};margin-top:12px;">“${esc(d.quote)}”</div>` : ''}
      ${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0">${cta}</table>` : ''}
      ${d.disclaimer ? `<div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;padding-top:12px;">${esc(d.disclaimer)}</div>` : ''}
    </td>
  </tr>
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
