import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface NavBarProps {
  activePage?: 'dashboard' | 'sns-accounts' | 'settings' | 'none';
}

export function NavBar({ activePage = 'none' }: NavBarProps) {
  return (
    <header className="border-b w-full">
      <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-primary">
            PRWIRE
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium ${
                activePage === 'dashboard' 
                  ? 'underline decoration-primary decoration-2 underline-offset-4' 
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/sns-accounts" 
              className={`text-sm font-medium ${
                activePage === 'sns-accounts' 
                  ? 'underline decoration-primary decoration-2 underline-offset-4' 
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
            >
              SNS Account Connection
            </Link>
            <Link 
              href="/dashboard/settings" 
              className={`text-sm font-medium ${
                activePage === 'settings' 
                  ? 'underline decoration-primary decoration-2 underline-offset-4' 
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
} 