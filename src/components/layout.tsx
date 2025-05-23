
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden" dir="rtl">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
