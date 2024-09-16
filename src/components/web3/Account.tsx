import { useAccount, useDisconnect } from "wagmi";

export default function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div>
      {address && <div>{address.slice(0, 6) + "..." + address.slice(-4)}</div>}
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
