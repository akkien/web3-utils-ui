"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
// import Wallet from "../web3";
import { SiBuymeacoffee } from "react-icons/si";
import CopyComponent from "../copy";

const Header = () => {
  const evmAddress = "0xDcb799a31E4CA56CBc224b92DA8721f973460e52";
  const solAddress = "5uMES4qFXAfnNKnpyEZPzRCjMkoLkGhDDa6rAf1ckRi5";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <header className={`fixed top-0 w-full z-50 bg-white`}>
      <nav
        aria-label='Global'
        className={`mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-8 ${isScrolled ? "shadow-nav" : ""}`}
      >
        <div className='flex lg:flex-1'>
          <Link href='/'>
            <span className='font-handlee font-semibold hover:cursor-pointer'>Utils Playground</span>
          </Link>
        </div>
        <div className='hidden lg:flex lg:flex-1 justify-between items-center space-x-4 text-sm font-quick'>
          <div className='flex flex-1 items-center justify-center space-x-10'>
            {/* <Link
              href='/app'
              className='font-semibold bg-transparent px-4 py-1 rounded-2xl hover:bg-blue-200 hover:text-white transition duration-300 ease-in-out'
            >
              App
            </Link> */}
            {/* <Link
              href='/about'
              className='font-semibold bg-transparent px-4 py-1 rounded-2xl hover:bg-blue-200 hover:text-white transition duration-300 ease-in-out'
            >
              About
            </Link> */}
          </div>
          <div className='flex-2'>
            {/* <Wallet /> */}
            <SiBuymeacoffee
              className='text-2xl hover:cursor-pointer text-amber-400'
              onClick={() => setIsModalOpen(!isModalOpen)}
            />
            {isModalOpen && (
              <div
                className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
                onClick={() => setIsModalOpen(false)}
              >
                <div className='bg-white p-6 rounded-lg shadow-lg' onClick={(e) => e.stopPropagation()}>
                  <p className='mb-4 font-bold text-center'>Buy me a cup of coffee ?!</p>
                  <div className='flex gap-4 mt-4 justify-between px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-300 ease-in-out'>
                    EVM chains: {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                    <CopyComponent textToCopy={evmAddress} />
                  </div>
                  <div className='flex gap-4 mt-4 justify-between px-4 py-2 bg-teal-400 text-white rounded-lg hover:bg-teal-500 transition duration-300 ease-in-out'>
                    Solana: {solAddress.slice(0, 6)}...{solAddress.slice(-4)}
                    <CopyComponent textToCopy={solAddress} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
