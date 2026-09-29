import Link from "next/link";

export function Topbar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Colombia Fintech — inicio">
          <img src="/brand/logo-gris-h.svg" alt="Colombia Fintech" />
        </Link>
        <nav>{children}</nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <img src="/brand/logo-gris-h.svg" alt="Colombia Fintech" />
        <span>© {new Date().getFullYear()} Colombia Fintech</span>
      </div>
    </footer>
  );
}
