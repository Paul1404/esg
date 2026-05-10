import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center font-bold text-lg shadow-soft">
          e
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Nothing here</h1>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">
          The page or signature you’re looking for doesn’t exist — or it may have been removed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link href="/" className="btn-ghost text-sm">Home</Link>
          <Link href="/editor" className="btn-primary text-sm">Open editor →</Link>
        </div>
      </div>
    </main>
  );
}
