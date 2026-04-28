import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GlobalErrorBoundary } from "@/components/layout/GlobalErrorBoundary";
import { ThemeProvider } from "@/components/providers";
import { WhatsAppFloating } from "@/components/ui/whatsapp-icon";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClippingPath & Website Services Studio | Professional Image & Video Editing Services",
    template: "%s | ClippingPath & Website Services Studio",
  },
  description: "Global leader in visual content. Professional clipping path services, cinematic video editing, and custom Next.js web development. 24h turnaround guaranteed. Serving 500+ clients across 120+ countries with 99.9% satisfaction rate.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    // Primary Keywords
    "Professional Image Editing Services",
    "Video Editing Services", 
    "Clipping Path Services",
    "AI Image Processing Automation",
    "Bulk Clipping Path Services",
    "Web Development Bangladesh",
    // Secondary Keywords
    "Background Removal",
    "Hand-drawn Vector Paths",
    "E-commerce Image Cutouts",
    "AI Background Removal",
    "Automated Image Upscaling",
    "AI-powered Retouching",
    "Product Photo Editing",
    "Image Masking Services",
    "Ghost Mannequin Effect",
    "Color Correction Services",
    "Photo Retouching",
    // Location Keywords
    "Dinajpur",
    "Bangladesh",
    "Chirirbandar",
    "Dhaka",
    "Sayed Nagar",
    // Service Keywords
    "Next.js Development",
    "React Development",
    "E-commerce Web Development",
    "Landing Page Design",
    "Custom Website Development",
    "Full-stack Development",
  ],
  authors: [
    { name: "Belal Sarker", url: "https://clippingbd.com" },
    { name: "Rakibul Hasan", url: "https://clippingbd.com" }
  ],
  creator: "Belal Sarker",
  publisher: "ClippingPath & Website Services Studio",
  metadataBase: new URL("https://clippingbd.com"),
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icon?s=16", sizes: "16x16", type: "image/png" },
      { url: "/icon?s=192", sizes: "192x192", type: "image/png" },
      { url: "/icon?s=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ClippingPath & Website Services Studio | Professional Image & Video Editing Services",
    description: "Global leader in visual content. Professional clipping path, cinematic video editing, and custom Next.js web development. 24h turnaround guaranteed.",
    type: "website",
    locale: "en_US",
    siteName: "ClippingPath & Website Services Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClippingPath & Website Services Studio - Professional Image, Video & Web Development Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClippingPath & Website Services Studio | Professional Image & Video Editing",
    description: "Global leader in visual content. 24/7 clipping path, video editing, web development. 24h turnaround. 99.9% satisfaction.",
    images: ["/og-image.png"],
    creator: "@clippingbd",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
verification: {
    google: "TOQM0-HHIWSkBoNUU4SLvp-C4l1eklGePz8rX85mmeM",
  },
  alternates: {
    canonical: "https://clippingbd.com",
    languages: {
      'en-US': 'https://clippingbd.com',
    },
  },
  category: "technology",
  // Local business schema
  other: {
    "geo.region": "BD-50",
    "geo.placename": "Dinajpur",
    "geo.position": "25.6456;88.7785",
    "ICBM": "25.6456, 88.7785",
  },
};

import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        {/* Resource Hints for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preload critical CMS data */}
        <link rel="preload" href="/api/cms/hero" as="fetch" crossOrigin="anonymous" />
        
        {/* Theme initialization script - prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored || 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ClippingPath & Website Services Studio",
              "alternateName": "ClippingBD",
              "url": "https://clippingbd.com",
              "logo": "https://clippingbd.com/icon?s=512",
              "description": "Professional Image, Video Editing & Web Development Services",
              "foundingDate": "2020",
              "founders": [
                {
                  "@type": "Person",
                  "name": "Belal Sarker"
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Chirirbandar",
                "addressLocality": "Dinajpur",
                "addressCountry": "BD",
                "postalCode": "5220"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+880-1749-616724",
                "contactType": "customer service",
                "availableLanguage": ["English", "Bengali"]
              },
              "sameAs": [
                "https://linkedin.com/company/clippingbd",
                "https://twitter.com/clippingbd",
                "https://facebook.com/clippingbd",
                "https://instagram.com/clippingbd",
                "https://youtube.com/@clippingbd"
              ]
            }),
          }}
        />
        {/* Structured Data for WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ClippingPath & Website Services Studio",
              "alternateName": "ClippingBD",
              "url": "https://clippingbd.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://clippingbd.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        {/* Structured Data for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "ClippingPath & Website Services Studio",
              "description": "Professional Image, Video Editing & Web Development Services",
              "url": "https://clippingbd.com",
              "logo": "https://clippingbd.com/logo.png",
              "image": "https://clippingbd.com/og-image.png",
              "telephone": "+8801749616724",
              "email": "info@clippingbd.com",
              "founder": {
                "@type": "Person",
                "name": "Belal Sarker",
                "jobTitle": "Admin & Owner",
                "description": "Leading the strategic vision and administrative operations of ClippingBD Studio",
                "image": "https://scontent.fdac207-1.fna.fbcdn.net/v/t39.30808-6/505586585_10232286807246264_9121306231597722044_n.jpg"
              },
              "employees": [
                {
                  "@type": "Person",
                  "name": "Rakibul Hasan",
                  "jobTitle": "Developer & Designer",
                  "description": "Architect behind ClippingBD's digital infrastructure specializing in Next.js and UI/UX design",
                  "image": "https://photos.fife.usercontent.google.com/pw/AP1GczPdNeIfoast3bziZkFtsBIwgDQ8XX68Thdq-dnRSJ99MMfzDlSIKCae=w686-h911-s-no-gm"
                }
              ],
              "address": [
                {
                  "@type": "PostalAddress",
                  "streetAddress": "Chirirbandar",
                  "addressLocality": "Dinajpur",
                  "addressCountry": "BD",
                  "postalCode": "5220",
                  "addressRegion": "Rangpur Division"
                },
                {
                  "@type": "PostalAddress",
                  "streetAddress": "House 04, Road 1, B Block, Sayed Nagar, East Vatara",
                  "addressLocality": "Dhaka",
                  "addressCountry": "BD",
                  "postalCode": "1212",
                  "addressRegion": "Dhaka Division"
                }
              ],
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 25.6456,
                "longitude": 88.7785
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              },
              "priceRange": "$$",
              "areaServed": "Worldwide",
              "sameAs": [
                "https://linkedin.com/company/clippingbd",
                "https://twitter.com/clippingbd",
                "https://facebook.com/clippingbd",
                "https://instagram.com/clippingbd",
                "https://youtube.com/@clippingbd"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Clipping Path Services",
                      "description": "Hand-drawn clipping paths for e-commerce product images"
                    },
                    "price": "0.20",
                    "priceCurrency": "USD"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Background Removal",
                      "description": "Professional background removal services"
                    },
                    "price": "0.15",
                    "priceCurrency": "USD"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Image Masking",
                      "description": "Complex image masking for hair, fur, and transparent objects"
                    },
                    "price": "0.50",
                    "priceCurrency": "USD"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Ghost Mannequin",
                      "description": "Professional ghost mannequin effect for apparel"
                    },
                    "price": "1.00",
                    "priceCurrency": "USD"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Web Development",
                      "description": "Custom Next.js and React web development"
                    },
                    "price": "2500",
                    "priceCurrency": "USD"
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "500",
                "bestRating": "5",
                "worstRating": "1"
              }
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <GlobalErrorBoundary>
            {children}
          </GlobalErrorBoundary>
          <Toaster position="top-right" richColors />
          <WhatsAppFloating />
        </ThemeProvider>
      </body>
    </html>
  );
}
