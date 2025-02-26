import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import ThemeProvider from "@/context/Theme";
import Navbar from "@/components/navigation/navbar";
import { Toaster } from "sonner";

const inter = localFont({
  src: "./fonts/Inter.ttf",
  variable: "--font-inter",
  weight: "100 200  300  400  500  600 700  800  900",
});
const SpaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk.ttf",
  variable: "--font-space-grotesk",
  weight: "  300  400  500  600 700",
});

export const metadata: Metadata = {
  title: "Dev Overflow",
  description:
    "A Blazing fast implementation of Stack Overflow, which is a Community based platform for asking and answering programming questions. Get help, share knowledge and collaborate with developers from all around the world. Explore topics in development, mobile app development, algorightms, data strucutures, and more.",
  icons: {
    icon: "/images/site-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${SpaceGrotesk.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
