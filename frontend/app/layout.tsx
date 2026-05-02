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
  title: "NSkill India - Technical Skill Training Institute Chennai",
    // ADD THIS
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  description: "Government certified skill training institute in Chennai offering HVAC, Electrical, Plumbing, Welding, MEP, Safety, Quality, Oil & Gas courses with 100% placement assistance.",
  keywords: "skill training Chennai, HVAC training Chennai, electrical course Chennai, plumbing training, NSDC certified, technical training institute, NSkill India, NTSC training",
  authors: [{ name: "NSkill India" }],
  creator: "NSkill India",
  metadataBase: new URL("https://nskillindia.com"),
  openGraph: {
    title: "NSkill India - Technical Skill Training Chennai",
    description: "Government certified skill training with 100% placement assistance. HVAC, Electrical, Plumbing, Welding & more.",
    url: "https://nskillindia.com",
    siteName: "NSkill India",
    images: [
      {
        url: "https://nskillindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NSkill India Training Institute Chennai",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NSkill India - Technical Skill Training Chennai",
    description: "Government certified skill training with 100% placement assistance.",
    images: ["https://nskillindia.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
//       <body className="antialiased">
//         <AuthProvider>          {/* ✅ ADDED — wraps entire app */}
//           <Navbar />
//           <main>{children}</main>
//           <Footer />
//           <CoursePopup />
//           <Chatbot />
//           <FloatingContact />
//         </AuthProvider>          {/* ✅ ADDED */}
//       </body>
//   </html>
//   );
// }
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
 <html lang="en">
  {/* <head>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/icon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-icon.png" />
  </head> */}
  <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/* ── JSON-LD Structured Data ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Niile Technical Skill & Consulting Pvt Ltd",
              "alternateName": "NSkill India",
              "url": "https://nskillindia.com",
              "logo": "https://nskillindia.com/logo.png",
              "description": "Government certified technical skill training institute in Chennai offering HVAC, Electrical, Plumbing, Welding, MEP courses",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Kovur",
                "addressLocality": "Chennai",
                "addressRegion": "Tamil Nadu",
                "postalCode": "600128",
                "addressCountry": "IN"
              },
              "telephone": "+91-98842-09774",
              "email": "nskilltraining@gmail.com",
              "foundingDate": "2018",
              "areaServed": "Chennai, Tamil Nadu, India",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Skill Training Courses",
                "itemListElement": [
                  { "@type": "Course", "name": "HVAC & Refrigeration Training" },
                  { "@type": "Course", "name": "Electrical Training" },
                  { "@type": "Course", "name": "Plumbing Training" },
                  { "@type": "Course", "name": "Welding Training" },
                  { "@type": "Course", "name": "MEP Training" },
                  { "@type": "Course", "name": "Safety Training" },
                  { "@type": "Course", "name": "Quality Training" },
                  { "@type": "Course", "name": "Oil & Gas Training" }
                ]
              }
            })
          }}
        />

        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <CoursePopup />
          <Chatbot />
          <FloatingContact />
        </AuthProvider>
      </body>
    </html>
  );
}