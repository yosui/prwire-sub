'use client';

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Hamburger } from "./Hamburgur";

interface NavBarProps {
  activePage?: 'dashboard' | 'settings' | 'none';
}

export function NavBar({ activePage = 'none' }: NavBarProps) {
  const { isSignedIn } = useAuth();
  const userIsSignedIn = isSignedIn === true;

  return (
    <header className="border-b w-full">
      <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/prwire_logo.svg"
              alt="PRWIRE Logo"
              width={70}
              height={20}
              className="h-5 w-auto"
              priority
            />
          </Link>
          {userIsSignedIn && (
            <nav className="hidden md:flex gap-6 ml-2">
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
          {userIsSignedIn ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/settings"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Settings
                </Link>
              </div>
              <UserButton afterSignOutUrl="/" />
              <div className="block md:hidden">
                <Hamburger isSignedIn={userIsSignedIn} activePage={activePage} />
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-4">
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
              </div>
              <div className="block md:hidden">
                <Hamburger isSignedIn={userIsSignedIn} activePage={activePage} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 