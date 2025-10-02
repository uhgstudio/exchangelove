import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 - 환승연애4 X예측",
  description: "환승연애4 관리자 페이지",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
