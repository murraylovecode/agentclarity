import { Link } from "react-router-dom";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <span className="text-foreground font-semibold text-lg tracking-tight">
            AgentClarity
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AgentClarity. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
