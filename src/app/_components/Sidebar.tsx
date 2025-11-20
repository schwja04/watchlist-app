"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const pathname = usePathname();
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    // Hamburger button for mobile (now handled in Header)
    // Removed from Sidebar

    // Sidebar drawer for mobile
    const MobileDrawer = sidebarOpen ? (
        <div className="fixed inset-0 z-40 flex bg-black/60">
            <aside className="relative flex h-full w-full flex-col bg-[var(--ctp-surface0)] p-6 shadow-2xl md:w-64">
                {/* Close button for mobile drawer */}
                <button
                    className="absolute top-4 right-4 z-50 rounded-full bg-[var(--ctp-mauve)] p-2 text-white shadow-lg"
                    aria-label="Close sidebar menu"
                    onClick={() => setSidebarOpen(false)}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                <div className="mb-8 flex flex-col items-center">
                    <img
                        src="/favicon.ico"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="mb-2"
                    />
                    <span className="text-xl font-bold">Watchlist</span>
                </div>
                <nav className="flex w-full flex-col gap-4 px-4">
                    <LinkItem
                        href="/"
                        text="Discover"
                        isActive={hydrated && pathname === "/"}
                        onClick={() => setSidebarOpen(false)}
                        icon={
                            <svg
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                            </svg>
                        }
                    />
                    <LinkItem
                        href="/watchlist"
                        text="My Watchlist"
                        isActive={hydrated && pathname === "/watchlist"}
                        onClick={() => setSidebarOpen(false)}
                        icon={
                            <svg
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M5 3v18l7-5 7 5V3z" />
                            </svg>
                        }
                    />
                    <LinkItem
                        href="/search"
                        text="Search"
                        isActive={hydrated && pathname === "/search"}
                        onClick={() => setSidebarOpen(false)}
                        icon={
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
                        }
                    />
                </nav>
            </aside>
            <div
                className="flex-1 cursor-pointer"
                onClick={() => setSidebarOpen(false)}
            />
        </div>
    ) : null;

    return (
        <>
            {/* Hamburger for mobile is now in Header */}
            {/* Sidebar for desktop */}
            <aside className="hidden w-64 flex-col bg-[var(--ctp-surface0)] md:flex">
                <div className="mt-4 mb-8 flex flex-col items-center">
                    <img
                        src="/favicon.ico"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="mb-2"
                    />
                    <span className="text-xl font-bold">Watchlist</span>
                </div>
                <nav className="flex w-full flex-col gap-4 px-4">
                    <LinkItem
                        href="/"
                        text="Discover"
                        isActive={hydrated && pathname === "/"}
                        icon={
                            <svg
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                            </svg>
                        }
                    />
                    <LinkItem
                        href="/watchlist"
                        text="My Watchlist"
                        isActive={hydrated && pathname === "/watchlist"}
                        icon={
                            <svg
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M5 3v18l7-5 7 5V3z" />
                            </svg>
                        }
                    />
                    <LinkItem
                        href="/search"
                        text="Search"
                        isActive={hydrated && pathname === "/search"}
                        icon={
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
                        }
                    />
                </nav>
            </aside>
            {/* Mobile drawer overlay */}
            {MobileDrawer}
        </>
    );
}

function LinkItem({
    href,
    text,
    isActive,
    onClick,
    icon,
}: {
    href: string;
    text: string;
    isActive: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center rounded px-3 py-2 font-semibold transition-colors ${isActive
                ? "bg-[var(--ctp-mauve)] text-[var(--ctp-base)]"
                : "text-[var(--ctp-text)] hover:bg-[var(--ctp-surface1)]"
                }`}
            onClick={onClick}
        >
            {icon && (
                <span
                    className={`mr-2 inline-block align-middle ${isActive ? "text-[var(--ctp-base)]" : "text-[var(--ctp-text)]"}`}
                >
                    {icon}
                </span>
            )}
            {text}
        </Link>
    );
}
