`use client`;
import type { Metadata } from "next";
import localFont from "next/font/local";
import Web3Provider from "../providers/web3/Provider";
import Wallet from "../components/web3/Wallet";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Lending Zk Profile",
  description: "Platform helping you to prove your defi activity profile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Web3Provider>
          <div>
            <Wallet />
          </div>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
