"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Wallet from "../web3";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 w-full z-500 bg-white transition-all duration-300 ${
        isScrolled ? "border-b-zinc-600" : ""
      }`}
    >
      <nav aria-label='Global' className='mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8'>
        <div className='flex lg:flex-1'>
          <Link href='/'>
            <span className='font-handlee font-semibold hover:cursor-pointer'>VerinLayer</span>
          </Link>
        </div>
        <div className='hidden lg:flex lg:flex-1 justify-between items-center space-x-4 text-sm font-quick'>
          <div className='flex flex-1 items-center justify-center space-x-10'>
            <Link
              href='/app'
              className='font-semibold bg-transparent px-4 py-1 rounded-2xl hover:bg-blue-200 hover:text-white transition duration-300 ease-in-out'
            >
              App
            </Link>
            <Link
              href='/about'
              className='font-semibold bg-transparent px-4 py-1 rounded-2xl hover:bg-blue-200 hover:text-white transition duration-300 ease-in-out'
            >
              About
            </Link>
          </div>
          <div className='flex-2'>
            <Wallet />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
