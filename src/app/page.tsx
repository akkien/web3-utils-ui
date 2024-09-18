"use client";
import { IoIosArrowForward } from "react-icons/io";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";
import { getBorrowHistory } from "./subgraph";
import { UserAaveProfile } from "@/types";
// https://app.aave.com/aave-com-logo-header.svg
export default function Home() {
  const account = useAccount();
  const balanceResult = useBalance({
    address: account.address,
  });
  const balance = balanceResult.data ? formatUnits(balanceResult.data.value, balanceResult.data.decimals) : "0";

  const [aaveInfo, setAaveInfo] = useState<UserAaveProfile>({
    borrowTxs: [],
    repayTxs: [],
    borrowAmount: BigInt(0),
    repayAmount: BigInt(0),
  });
  useEffect(() => {
    const getAaveInfo = async () => {
      const result = await getBorrowHistory(
        "0x39f130486283456afea838e1180627b05b39c796",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      );
      setAaveInfo(result);
    };
    getAaveInfo();
  }, [account.address]);
  console.log("aaveInfo", aaveInfo);

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center p-4 gap-16 sm:p-20 mt-32'>
      <div className='flex justify-between'>
        <div className='w-2/5'>
          <div className='shadow-lg min-h-96 rounded-md bg-slate-50 px-4'>
            <p className='font-semibold text-lg text-center'>Your Aave profile</p>
            <p className='text-sm'>Address: {account.address}</p>
            <p className='text-sm'>
              Balance: {parseFloat(balance).toFixed(5)} {balanceResult.data?.symbol ?? ""}
            </p>
            <p className='text-sm'>Borrow transactions: {aaveInfo.borrowTxs.length}</p>
            <p className='text-sm'>Total borrow amount: {aaveInfo.borrowAmount.toString()}</p>
            <p className='text-sm'>Repay transactions: {aaveInfo.repayTxs.length}</p>
            <p className='text-sm'>Total repay amount: {aaveInfo.repayAmount.toString()}</p>
          </div>
        </div>
        <div className='w-1/5'>
          <div className='flex flex-row justify-center items-center min-h-48'>
            <IoIosArrowForward size={30} className='hover:cursor-pointer' />
          </div>
        </div>
        <div className='w-2/5'>
          <div className='flex justify-center shadow-lg min-h-96'>
            <p>Your score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
