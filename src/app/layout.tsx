import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import Web3Provider from "../providers/web3/Provider";
import { getConfig } from "../providers/web3/config";
// import Wallet from "../components/web3";
// import { GiCoinflip } from "react-icons/gi";
import Header from "../components/header";
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
  const initialState = cookieToInitialState(getConfig(), headers().get("cookie"));

  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Web3Provider initialState={initialState}>
          <Header />
          <div className='mx-auto max-w-7xl px-8 mt-48'>{children}</div>
        </Web3Provider>
      </body>
    </html>
  );
}
