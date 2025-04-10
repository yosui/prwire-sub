'use client';

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface NavBarProps {
  activePage?: 'dashboard' | 'settings' | 'none';
}

export function NavBar({ activePage = 'none' }: NavBarProps) {
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b w-full">
      <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-primary">
            PRWIRE
          </Link>
          {isSignedIn && (
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
          )}
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link 
                href="/dashboard"
                className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/settings"
                className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link href="/sign-in" passHref>
                <div className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Sign In
                </div>
              </Link>
              <Link href="/sign-up" passHref>
                <div className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                  Sign Up
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 