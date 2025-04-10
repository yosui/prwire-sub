import { auth } from "@clerk/nextjs/server";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar activePage="dashboard" />
      <main className="flex-1 w-full">
        <div className="container mx-auto max-w-screen-xl px-4 py-6 md:px-6 md:py-8 lg:py-10">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 



