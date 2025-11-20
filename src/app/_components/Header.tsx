"use client";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function HeaderSearchRealtime() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("query") ?? "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInput(searchParams.get("query") ?? "");
  }, [pathname, searchParams]);

  useEffect(() => {
    // Cleanup debounce timer on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const updateQueryParam = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("query", value);
    } else {
      params.delete("query");
    }
    const newUrl = `/search${params.toString() ? "?" + params.toString() : ""}`;
    if (pathname !== "/search") {
      router.push(newUrl);
    } else {
      router.replace(newUrl);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        updateQueryParam(value);
      } else {
        // If input is empty, clear the query param and results
        updateQueryParam("");
      }
    }, 350);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      updateQueryParam(input);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full rounded-full bg-[var(--ctp-surface0)] px-5 py-2 pl-12 text-lg text-[var(--ctp-text)] shadow transition-all duration-200 focus:ring-2 focus:ring-[var(--ctp-lavender)] focus:outline-none"
        placeholder="Search movies..."
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label="Search movies"
        autoComplete="off"
      />
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--ctp-lavender)]">
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
    </div>
  );
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header
      className="flex h-16 w-full items-center gap-4 p-4"
      style={{
        backgroundColor: "var(--ctp-surface1)",
        color: "var(--ctp-text)",
      }}
    >
      {/* Hamburger menu for mobile */}
      <button
        className="mr-2 block rounded bg-[var(--ctp-mauve)] p-2 text-white shadow-lg md:hidden"
        aria-label={sidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex flex-1 items-center">
        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
          {/* HeaderSearchRealtime: Controlled, debounced search input */}
          <HeaderSearchRealtime />
        </form>
      </div>
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="text-ceramic-white h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium sm:h-12 sm:px-5 sm:text-base">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
