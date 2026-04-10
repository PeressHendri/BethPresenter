import { HeaderBar } from './HeaderBar';
import { Sidebar }   from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--surface-primary)] text-[var(--text-200)]"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <HeaderBar />

      {/* ── Main Production Workspace ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: Global Navigation Sidebar */}
        <Sidebar />

        {/* Center/Right: Route Content */}
        <main className="flex-1 flex overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* Global Bottom Status (Optional in screenshot but useful) */}
      {/* In G-Presenter, the footer is often part of the center panel or live panel. */}
    </div>
  );
}
