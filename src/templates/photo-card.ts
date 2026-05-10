import type { SignatureData } from '@/lib/types';
import {
  buildContactRows,
  contactRowHtml,
  esc,
  img,
  renderSocialRow,
  wrapSignature,
} from '@/lib/template-helpers';

export function renderPhotoCard(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted } = d;
  const rows = buildContactRows(d)
    .map((r) => contactRowHtml(r, { textColor: text, mutedColor: muted, primaryColor: accent, fontFamily, fontSize: baseSize }))
    .join('');
  const socialRow = renderSocialRow(d.socials, accent, 24);
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';

  const tintBg = `${accent}1a`; // ~10% alpha hex (8-digit hex falls back gracefully in clients that ignore it)

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${tintBg};border-radius:12px;">
  <tr>
    ${d.photoUrl ? `<td valign="top" width="120" style="width:120px;padding:18px 0 18px 18px;">${img({ src: d.photoUrl, alt: d.fullName, width: 110, height: 110, round: true, style: 'border:4px solid #ffffff;' })}</td>` : ''}
    <td valign="top" style="padding:18px;">
      <div style="font-family:${fontFamily};font-size:${baseSize + 5}px;font-weight:800;color:${text};line-height:1.15;">${esc(d.fullName)}${credentialSuffix}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${accent};line-height:1.4;font-weight:600;padding-top:3px;">${esc(d.jobTitle)}</div>
      <div style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.4;padding-top:1px;">${esc(d.company)}${d.department ? ` · ${esc(d.department)}` : ''}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:12px;">${rows}</table>
      ${socialRow ? `<div style="padding-top:12px;">${socialRow}</div>` : ''}
    </td>
  </tr>
  ${d.disclaimer ? `<tr><td colspan="${d.photoUrl ? 2 : 1}" style="padding:0 18px 14px 18px;"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;">${esc(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
