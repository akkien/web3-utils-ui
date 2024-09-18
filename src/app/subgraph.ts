/* eslint-disable @typescript-eslint/no-explicit-any */
const APIURL = `https://gateway.thegraph.com/api/${
  process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY ?? ""
}/subgraphs/id/Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g`;

console.log("APIURL", APIURL);

const createQuery = (user: string) => {
  return `query {
userTransactions(
  orderBy: timestamp
  orderDirection: asc
  where: {and: 
    [{user: "${user.toLowerCase()}"},
    {or: [{action: Borrow},{action: Repay}]}]
  }
) {
  action
  txHash
  id
  ... on Borrow {
    assetPriceUSD
    amount
    stableTokenDebt
    variableTokenDebt
    reserve {
      underlyingAsset
    }
  }
  ... on Repay {
    amount
    assetPriceUSD
    reserve {
      underlyingAsset
    }
  }
}
}
`;
};

export const getBorrowHistory = async (user: string, asset: string) => {
  let result = await fetch(APIURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: createQuery(user) }),
  });

  result = await result.json();
  const txs = (result as any).data.userTransactions as any[];
  const assetTxs = txs.filter((item: any) => item.reserve.underlyingAsset === asset.toLowerCase());

  let sumBorrow = BigInt(0);
  let sumRepay = BigInt(0);

  assetTxs.forEach((item: any) => {
    if (item.action === "Borrow") {
      sumBorrow = sumBorrow + BigInt(item.amount);
    }
    if (item.action === "Repay") {
      sumRepay = sumRepay + BigInt(item.amount);
    }
  });

  console.log("getBorrowHistory run");

  return {
    borrowTxs: assetTxs.filter((item) => item.action === "Borrow"),
    repayTxs: assetTxs.filter((item) => item.action === "Repay"),
    borrowAmount: sumBorrow,
    repayAmount: sumRepay,
  };
};
