import * as React from "react";
import { Connector, useConnect } from "wagmi";

export default function WalletOptions() {
  const { connectors, connect } = useConnect();
  const connector = connectors.find((item) => item.name === "MetaMask");
  return connector ? (
    <WalletOption key={connector.uid} connector={connector} onClick={() => connect({ connector })} />
  ) : null;
}

function WalletOption({ connector, onClick }: { connector: Connector; onClick: () => void }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <button
      disabled={!ready}
      onClick={onClick}
      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
    >
      Connect Wallet
    </button>
  );
}
