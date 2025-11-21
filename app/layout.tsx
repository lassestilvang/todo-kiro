import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar, Header } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";
import { AppInitializer } from "@/components/providers";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { TaskFormDialog, TaskEditDialog } from "@/components/task";

// Initialize database on server side
import "@/lib/server-init";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Daily Task Planner",
  description: "A modern task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <ThemeProvider>
          <AppInitializer>
            <KeyboardShortcutsProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden w-full md:w-auto">
                  <Header />
                  <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6" tabIndex={-1}>
                    {children}
                  </main>
                </div>
              </div>
              <TaskFormDialog />
              <TaskEditDialog />
              <Toaster />
            </KeyboardShortcutsProvider>
          </AppInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
