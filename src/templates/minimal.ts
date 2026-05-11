import type { SignatureData } from '@/lib/types';
import { esc, escMultiline, renderClose, renderCompanyLegal, resolveLayout, safeUrl, wrapSignature } from '@/lib/template-helpers';

export function renderMinimal(d: SignatureData): string {
  const { fontFamily, fontSize: baseSize, primaryColor: accent, textColor: text, mutedColor: muted, dividerColor: divider } = d;
  const credentialSuffix = d.credentials ? `, ${esc(d.credentials)}` : '';
  const layout = resolveLayout(d);

  const contactPieces: string[] = [];
  if (d.email) contactPieces.push(`<a href="mailto:${esc(d.email)}" style="color:${text};text-decoration:none;">${esc(d.email)}</a>`);
  if (d.phone) contactPieces.push(`<a href="tel:${esc(d.phone.replace(/[^+\d]/g, ''))}" style="color:${text};text-decoration:none;">${esc(d.phone)}</a>`);
  if (d.website) contactPieces.push(`<a href="${safeUrl(d.website)}" target="_blank" rel="noopener" style="color:${accent};text-decoration:none;">${esc(d.website.replace(/^https?:\/\//, ''))}</a>`);

  const close = renderClose({ value: d.complimentaryClose, textColor: text, fontFamily, fontSize: baseSize, tableRow: true });
  const legal = renderCompanyLegal({ value: d.companyLegal, mutedColor: muted, dividerColor: divider, fontFamily, fontSize: baseSize, tableRow: true });
  const ruleRow = layout.sectionDividers
    ? `<tr><td data-esg-region="rule" style="padding-top:${Math.round(layout.gap / 2)}px;border-top:1px solid ${divider};"></td></tr>`
    : '';

  const inner = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  ${close}
  <tr><td style="font-family:${fontFamily};font-size:${baseSize + 1}px;color:${text};font-weight:700;line-height:1.4;">${esc(d.fullName)}${credentialSuffix}</td></tr>
  <tr><td style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.5;">${esc(d.jobTitle)}${d.company ? ` · ${esc(d.company)}` : ''}</td></tr>
  ${ruleRow}
  <tr><td data-esg-region="contact" style="font-family:${fontFamily};font-size:${baseSize}px;color:${muted};line-height:1.6;padding-top:${Math.round(layout.gap / 2)}px;">${contactPieces.join(' &nbsp;·&nbsp; ')}</td></tr>
  ${legal}
  ${d.disclaimer ? `<tr><td data-esg-region="disclaimer" style="padding-top:${layout.gap}px;font-family:${fontFamily};font-size:${baseSize - 3}px;color:${muted};line-height:1.5;">${escMultiline(d.disclaimer)}</td></tr>` : ''}
</table>`;

  return wrapSignature({ width: d.layoutWidth, inner, fontFamily, fontSize: baseSize });
}
