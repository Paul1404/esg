import type { SignatureData } from '@/lib/types';
import { esc, safeUrl, wrapSignature } from '@/lib/template-helpers';

export function renderMinimal(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted, dividerColor: divider } = d;
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';

  const contactPieces: string[] = [];
  if (d.email) contactPieces.push(`<a href="mailto:${esc(d.email)}" style="color:${text};text-decoration:none;">${esc(d.email)}</a>`);
  if (d.phone) contactPieces.push(`<a href="tel:${esc(d.phone.replace(/[^+\d]/g, ''))}" style="color:${text};text-decoration:none;">${esc(d.phone)}</a>`);
  if (d.website) contactPieces.push(`<a href="${safeUrl(d.website)}" target="_blank" rel="noopener" style="color:${accent};text-decoration:none;">${esc(d.website.replace(/^https?:\/\//, ''))}</a>`);

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr><td style="font-family:${fontFamily};font-size:${baseSize + 1}px;color:${text};font-weight:700;line-height:1.4;">${esc(d.fullName)}${credentialSuffix}</td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.5;">${esc(d.jobTitle)}${d.company ? ` · ${esc(d.company)}` : ''}</td></tr>
  <tr><td style="padding-top:6px;border-top:1px solid ${divider};margin-top:6px;"></td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.6;padding-top:6px;">${contactPieces.join(' &nbsp;·&nbsp; ')}</td></tr>
  ${d.disclaimer ? `<tr><td style="padding-top:10px;font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;">${esc(d.disclaimer)}</td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
