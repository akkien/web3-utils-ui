import Footer from "../components/footer";

export default function Home() {
  return (
    <div className='flex flex-col justify-between space-y-2'>
      <div className="rounded-xl mt-16 bg-cover bg-center bg-[url('/images/aave_small.png')]">
        <div className='h-[512px] backdrop-blur-sm rounded-xl flex flex-col justify-center items-center p-64'>
          <p className='text-white text-center text-5xl'>
            Empowering Traders with <br /> Credit Points
          </p>
          <br />
          <br />
          <p className='text-white text-xl'>
            At VerinLayer, we help traders turn their borrowing history into valuable credit points. Our mission is to
            provide a transparent and efficient verification layer for all your financial needs.
          </p>
          <button className='mt-6 bg-blue-500 hover:bg-blue-300 text-white py-2 px-4 rounded-3xl'>Contact Us</button>
        </div>
      </div>
      <div className='py-24'>
        <p className='text-3xl'>Boost your defi profile with 4 simple steps:</p>
        <ol>
          <li className='text-xl'>Step 1: Select lending project that you had borrowed tokens</li>
          <li className='text-xl'>Step 2: Click prove my points to blockchain</li>
          <li className='text-xl'>Step 3: Check out</li>
          <li className='text-xl'>
            Step 4: Go to lending project you want to borrow and enjoy better lending percentage{" "}
          </li>
        </ol>
      </div>
      <div className='py-24'>
        <p className='text-3xl'>Boost your defi profile with 4 simple steps:</p>
        <ol>
          <li className='text-xl'>Step 1: Select lending project that you had borrowed tokens</li>
          <li className='text-xl'>Step 2: Click prove my points to blockchain</li>
          <li className='text-xl'>Step 3: Check out</li>
          <li className='text-xl'>
            Step 4: Go to lending project you want to borrow and enjoy better lending percentage{" "}
          </li>
        </ol>
      </div>
      <Footer />
    </div>
  );
}
