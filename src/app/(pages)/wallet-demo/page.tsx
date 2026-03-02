import Providers from '@/context/coinbase-provider'
import WalletDemoClient from '@/components/WalletDemoClient'

export default function WalletDemo() {
  return (
    <Providers>
      <WalletDemoClient />
    </Providers>
  )
}
