import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "환승연애4 X예측 | 환승연애4 X예측",
  description: "환승연애4 출연자들의 X를 예측하고 결과를 확인해보세요! 실시간 예측, 랭킹, 통계를 제공하는 환승연애4 팬 커뮤니티",
  keywords: "환승연애4, 환승연애, X예측, 예측, 환승연애4예측, 환승연애4X, 환승연애4출연자",
  openGraph: {
    title: "환승연애4 X예측 | 환승연애4 X예측",
    description: "환승연애4 출연자들의 X를 예측하고 결과를 확인해보세요!",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "환승연애4 X예측 | 환승연애4 X예측",
    description: "환승연애4 출연자들의 X를 예측하고 결과를 확인해보세요!",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "환승연애4 X예측",
    "description": "환승연애4 출연자들의 X를 예측하고 결과를 확인해보세요!",
    "url": "https://your-domain.com", // 실제 도메인으로 변경 필요
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://your-domain.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "keywords": "환승연애4, 환승연애, X예측, 예측, 환승연애4예측, 환승연애4X, 환승연애4출연자"
  };

  return (
    <html lang="ko">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1595756211338642"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
