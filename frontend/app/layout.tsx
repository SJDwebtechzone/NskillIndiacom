import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import CoursePopup from "./components/CoursePopup";
import Chatbot from "./components/Chatbot";
import FloatingContact from "./components/FloatingContact";
import { AuthProvider } from "@/app/context/AuthContext"; // ✅ ADDED

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NSkill India",
  description: "Technical Skill Training & Corporate Consulting Excellence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>          {/* ✅ ADDED — wraps entire app */}
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CoursePopup />
          <Chatbot />
          <FloatingContact />
        </AuthProvider>          {/* ✅ ADDED */}
      </body>
  </html>
  );
}
