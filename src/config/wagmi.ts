import { http, createConfig } from 'wagmi'
import { mainnet, base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID

export const config = createConfig({
  chains: [mainnet, base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'VoteChain' }),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}