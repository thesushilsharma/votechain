 'use client'

 import Providers from '@/context/coinbase-provider'
 import ClientApp from '@/components/coinbase/coinbase-client'

 export default function CoinbasePage() {
   return (
     <Providers>
       <ClientApp />
     </Providers>
   )
 }
