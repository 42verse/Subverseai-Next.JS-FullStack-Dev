import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Suspense } from "react";
import Loading from "@/app/components/Loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SUBVERSEAI",
  description: "SUBVERSEAI PVT LTD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<Loading />}>
            <Navbar/>
            {children}
            <Footer />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
