import { useAccount, useDisconnect } from "wagmi";

export default function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div>
      <button
        onClick={() => disconnect()}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl'
      >
        {address ? address.slice(0, 6) + "..." + address.slice(-4) : ""}
      </button>
    </div>
  );
}
