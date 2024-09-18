import React from "react";
import { TbCoinPound } from "react-icons/tb";
import Link from "next/link";
import Wallet from "../web3";

const Header = () => {
  return (
    <header>
      <nav aria-label='Global' className='mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8'>
        <div className='flex lg:flex-1'>
            <Link href="/"><TbCoinPound size={30} /></Link>
        </div>
        <div className='hidden lg:flex lg:flex-1 lg:justify-end items-center text-sm'>
          <Link href='/about' className='mx-32 font-bold'>
            About
          </Link>
          <Wallet />
        </div>
      </nav>
    </header>
  );
};

export default Header;
