import type { SignatureData, TemplateId } from '@/lib/types';
import { renderClassic } from './classic';
import { renderModern } from './modern';
import { renderMinimal } from './minimal';
import { renderCorporate } from './corporate';
import { renderCreative } from './creative';
import { renderHorizontal } from './horizontal';
import { renderPhotoCard } from './photo-card';
import { renderCompact } from './compact';
import { renderLogoLeft } from './logo-left';
import { renderLogoBottom } from './logo-bottom';
import { renderCentered } from './centered';

export function renderTemplate(id: TemplateId, data: SignatureData): string {
  switch (id) {
    case 'classic':
      return renderClassic(data);
    case 'modern':
      return renderModern(data);
    case 'minimal':
      return renderMinimal(data);
    case 'corporate':
      return renderCorporate(data);
    case 'creative':
      return renderCreative(data);
    case 'horizontal':
      return renderHorizontal(data);
    case 'photo-card':
      return renderPhotoCard(data);
    case 'compact':
      return renderCompact(data);
    case 'logo-left':
      return renderLogoLeft(data);
    case 'logo-bottom':
      return renderLogoBottom(data);
    case 'centered':
      return renderCentered(data);
    default:
      return renderModern(data);
  }
}
