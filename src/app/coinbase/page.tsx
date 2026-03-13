import ClientApp from '@/components/coinbase/coinbase-client'
import Providers from '@/context/coinbase-provider'

export default function CoinbasePage() {
  return (
    <Providers>
      <ClientApp />
    </Providers>
  )
}
