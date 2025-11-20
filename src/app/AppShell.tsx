"use client";
import React from "react";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex min-w-1/2 flex-1 flex-col md:max-w-7/8">
        <React.Suspense fallback={null}>
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </React.Suspense>
        <main className="scrollbar-hide flex h-screen flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
