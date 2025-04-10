'use client';

import { useState } from "react";
import Link from "next/link";

interface HamburgerProps {
  isSignedIn: boolean;
  activePage?: 'dashboard' | 'settings' | 'none';
}

export function Hamburger({ isSignedIn, activePage = 'none' }: HamburgerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Hamburger Button */}
      <button 
        type="button"
        className="flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span 
          className={`block w-6 h-0.5 bg-foreground transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span 
          className={`block w-6 h-0.5 bg-foreground transition-opacity duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span 
          className={`block w-6 h-0.5 bg-foreground transition-transform duration-300 ease-in-out ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg p-4 z-50">
          <nav className="flex flex-col space-y-4">
            {isSignedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium px-4 py-2 rounded-md ${
                    activePage === 'dashboard' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                  }`}
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/settings" 
                  className={`text-sm font-medium px-4 py-2 rounded-md ${
                    activePage === 'settings' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                  }`}
                  onClick={toggleMenu}
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/sign-in" 
                  className="text-sm font-medium px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={toggleMenu}
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
