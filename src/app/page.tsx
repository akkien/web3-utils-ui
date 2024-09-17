import { IoIosArrowForward } from "react-icons/io";

// https://app.aave.com/aave-com-logo-header.svg
export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center p-4 pb-20 gap-16 sm:p-20'>
      <div className='flex justify-between'>
        <div className='w-2/5'>
          <div className='flex justify-center'>
            <p>Your Aave profile</p>
          </div>
        </div>
        <div className='w-1/5'>
          <div className='flex justify-center'>
            <IoIosArrowForward size={30} />
          </div>
        </div>
        <div className='w-2/5'>
          <div className='flex justify-center'>
            <p>Your score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
