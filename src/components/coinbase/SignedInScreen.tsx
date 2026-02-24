"use client";

import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  http,
  formatEther,
  type PublicClient,
  type Transport,
  type Address,
} from "viem";
import { baseSepolia, base } from "viem/chains";

import Header from "./Header";
import SmartAccountTransaction from "@/components/coinbase/SmartAccountTransaction";
import UserBalance from "@/components/coinbase/UserBalance";
import FundWallet from "@/components/coinbase/FundWallet";

/**
 * Create a viem client to access user's balance on the Base network
 */
const client = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * Create a viem client to access user's balance on the Base Sepolia network
 */
const sepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const useEvmBalance = (
  address: Address | null,
  client: PublicClient<Transport, typeof base | typeof baseSepolia, undefined, undefined>,
  poll = false,
) => {
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  const formattedBalance = useMemo(() => {
    if (balance === undefined) return undefined;
    return formatEther(balance);
  }, [balance]);

  const getBalance = useCallback(async () => {
    if (!address) return;
    const balance = await client.getBalance({ address });
    setBalance(balance);
  }, [address, client]);

  useEffect(() => {
    if (!poll) {
      getBalance();
      return;
    }
    const interval = setInterval(getBalance, 500);
    return () => clearInterval(interval);
  }, [getBalance, poll]);

  return { balance, formattedBalance, getBalance };
};

/**
 * The Signed In screen with onramp support
 */
export default function SignedInScreen() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();

  const { formattedBalance, getBalance } = useEvmBalance(evmAddress, client, true);
  const { formattedBalance: formattedBalanceSepolia, getBalance: getBalanceSepolia } =
    useEvmBalance(evmAddress, sepoliaClient, true);

  return (
    <>
      <Header />
      <main className="main flex-col-container flex-grow">
        <p className="page-heading">Fund your EVM wallet on Base</p>
        <div className="main-inner flex-col-container">
          <div className="card card--user-balance">
            <UserBalance balance={formattedBalance} />
          </div>
          <div className="card card--transaction">
             {isSignedIn && evmAddress && (
              <FundWallet
                onSuccess={getBalance}
                network="base"
                cryptoCurrency="eth"
                destinationAddress={evmAddress}
              />
            )}
          </div>
        </div>
        <hr className="page-divider" />
        <p className="page-heading">Send an EVM transaction on Base Sepolia</p>
        <div className="main-inner flex-col-container">
          <div className="card card--user-balance">
            <UserBalance
              balance={formattedBalanceSepolia}
              faucetName="Base Sepolia Faucet"
              faucetUrl="https://portal.cdp.coinbase.com/products/faucet"
            />
          </div>
          <div className="card card--transaction">
            {isSignedIn && (
              <SmartAccountTransaction
                balance={formattedBalanceSepolia}
                onSuccess={getBalanceSepolia}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
