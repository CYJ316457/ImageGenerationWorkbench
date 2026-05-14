import type { Metadata } from "next";
import type { ReactNode } from "react";

import { APP_NAME } from "@/lib/config";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "可部署到服务端、通过网页访问的生图与编辑工作台。"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
