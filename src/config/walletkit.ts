import { Core } from '@walletconnect/core'
import { WalletKit } from '@reown/walletkit'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'

let walletKit: any = null
let core: any = null

export const initWalletKit = async () => {
  if (walletKit) return walletKit

  try {
    // Initialize Core
    core = new Core({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
      customStoragePrefix: `walletConnect-${Date.now()}`, // Unique prefix for each test
    })

    // Initialize WalletKit
    walletKit = await WalletKit.init({
      core,
      metadata: {
        name: 'VoteChain',
        description: 'Transparent, Decentralized Voting on the Blockchain'
      },
    })

    console.log('WalletKit initialized successfully')
    return walletKit
  } catch (error) {
    console.error('Failed to initialize WalletKit:', error)
    throw error
  }
}

export const getWalletKit = () => {
  if (!walletKit) {
    throw new Error('WalletKit not initialized. Call initWalletKit() first.')
  }
  return walletKit
}

// Supported namespaces for VoteChain
export const SUPPORTED_NAMESPACES = {
  eip155: {
    chains: ['eip155:1', 'eip155:8453', 'eip155:84532'], // Ethereum, Base, Base Sepolia
    methods: [
      'eth_accounts',
      'eth_requestAccounts',
      'eth_sendRawTransaction',
      'eth_sign',
      'eth_signTransaction',
      'eth_signTypedData',
      'eth_signTypedData_v3',
      'eth_signTypedData_v4',
      'eth_sendTransaction',
      'personal_sign',
      'wallet_switchEthereumChain',
      'wallet_addEthereumChain',
    ],
    events: ['chainChanged', 'accountsChanged', 'message', 'disconnect', 'connect'],
    accounts: [], // Will be populated with user accounts
  },
}

// Helper function to build approved namespaces
export const buildVoteChainNamespaces = (
  proposal: any,
  userAccounts: string[]
) => {
  const supportedNamespaces = {
    ...SUPPORTED_NAMESPACES,
    eip155: {
      ...SUPPORTED_NAMESPACES.eip155,
      accounts: userAccounts,
    },
  }

  return buildApprovedNamespaces({
    proposal,
    supportedNamespaces,
  })
}

export { getSdkError }