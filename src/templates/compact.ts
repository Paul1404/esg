import type { SignatureData } from '@/lib/types';
import { esc, escMultiline, safeUrl, wrapSignature } from '@/lib/template-helpers';

export function renderCompact(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted } = d;
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';

  const contact: string[] = [];
  if (d.email) contact.push(`<a href="mailto:${esc(d.email)}" style="color:${text};text-decoration:none;">${esc(d.email)}</a>`);
  if (d.phone) contact.push(`<span style="color:${muted};">${esc(d.phone)}</span>`);
  if (d.website) contact.push(`<a href="${safeUrl(d.website)}" style="color:${accent};text-decoration:none;">${esc(d.website.replace(/^https?:\/\//, ''))}</a>`);

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${text};line-height:1.5;">
    <strong style="color:${text};">${esc(d.fullName)}${credentialSuffix}</strong> <span style="color:${muted};">— ${esc(d.jobTitle)}${d.company ? `, ${esc(d.company)}` : ''}</span>
  </td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize - 1}px;color:${muted};line-height:1.5;">${contact.join(' &nbsp;·&nbsp; ')}</td></tr>
  ${d.disclaimer ? `<tr><td style="font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.4;padding-top:6px;">${escMultiline(d.disclaimer)}</td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
