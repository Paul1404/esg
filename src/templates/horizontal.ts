import type { SignatureData } from '@/lib/types';
import { esc, escMultiline, img, renderSocialRow, safeUrl, wrapSignature } from '@/lib/template-helpers';

export function renderHorizontal(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted, dividerColor: divider } = d;
  const socialRow = renderSocialRow(d.socials, accent, 22);

  const contactPieces: string[] = [];
  if (d.email) contactPieces.push(`<a href="mailto:${esc(d.email)}" style="color:${text};text-decoration:none;">${esc(d.email)}</a>`);
  if (d.phone) contactPieces.push(`<a href="tel:${esc(d.phone.replace(/[^+\d]/g, ''))}" style="color:${text};text-decoration:none;">${esc(d.phone)}</a>`);
  if (d.website) contactPieces.push(`<a href="${safeUrl(d.website)}" style="color:${accent};text-decoration:none;">${esc(d.website.replace(/^https?:\/\//, ''))}</a>`);

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr>
    ${d.photoUrl ? `<td valign="middle" width="56" style="width:56px;padding-right:12px;">${img({ src: d.photoUrl, alt: d.fullName, width: 48, height: 48, round: true })}</td>` : ''}
    <td valign="middle">
      <div style="font-family:${fontFamily};font-size:${baseSize + 1}px;font-weight:700;color:${text};line-height:1.3;">
        ${esc(d.fullName)} <span style="color:${muted};font-weight:400;">&middot; ${esc(d.jobTitle)}${d.company ? `, ${esc(d.company)}` : ''}</span>
      </div>
      <div style="font-family:${fontFamily};font-size:${baseSize - 1}px;color:${muted};line-height:1.5;padding-top:3px;">
        ${contactPieces.join(' &nbsp;·&nbsp; ')}
      </div>
    </td>
    ${socialRow ? `<td valign="middle" align="right" style="padding-left:12px;">${socialRow}</td>` : ''}
  </tr>
  ${d.disclaimer ? `<tr><td colspan="${d.photoUrl ? 3 : 2}" style="padding-top:8px;border-top:1px solid ${divider};margin-top:8px;"><div style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.4;padding-top:8px;">${escMultiline(d.disclaimer)}</div></td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
