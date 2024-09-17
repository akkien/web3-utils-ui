"use client";
import React from "react";
import { useAccount } from "wagmi";
import Connect from "./Connect";
import Account from "./Account";

const Wallet = () => {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <Connect />;
};

export default Wallet;
