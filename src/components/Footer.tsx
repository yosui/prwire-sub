import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/10 w-full mt-auto">
      <div className="container mx-auto max-w-screen-xl flex flex-col items-center justify-between gap-4 py-6 px-4 md:py-8 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PRWIRE. All rights reserved.
        </p>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
} 