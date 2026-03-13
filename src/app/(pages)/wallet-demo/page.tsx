import WalletDemoClient from '@/components/WalletDemoClient'
import Providers from '@/context/coinbase-provider'

export default function WalletDemo() {
  return (
    <Providers>
      <WalletDemoClient />
    </Providers>
  )
}
