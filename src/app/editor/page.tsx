import { Suspense } from 'react';
import EditorClient from '@/components/editor/EditorClient';

export const dynamic = 'force-dynamic';

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-text-muted">Loading editor…</div>}>
      <EditorClient />
    </Suspense>
  );
}
