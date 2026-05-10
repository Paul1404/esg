import { Suspense } from 'react';
import EditorClient from '@/components/editor/EditorClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Editor',
};

function EditorSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-bg-elev/60 h-14 flex items-center px-5 gap-3">
        <div className="h-7 w-7 rounded-md bg-bg-card" />
        <div className="h-4 w-20 rounded bg-bg-card" />
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr]">
        <aside className="border-r border-border p-5 space-y-3">
          <div className="h-8 rounded bg-bg-card animate-pulse" />
          <div className="h-32 rounded bg-bg-card animate-pulse" />
          <div className="h-32 rounded bg-bg-card animate-pulse" />
        </aside>
        <main className="p-5 space-y-4">
          <div className="h-80 rounded-lg bg-bg-card animate-pulse" />
          <div className="h-32 rounded-lg bg-bg-card animate-pulse" />
        </main>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorClient />
    </Suspense>
  );
}
