 'use client'
 
 import { useState } from 'react'
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { useEvmAddress, useIsSignedIn, useSignEvmMessage } from '@coinbase/cdp-hooks'
 import { AuthButton } from '@coinbase/cdp-react/components/AuthButton'
 
 export default function WalletDemoClient() {
   const { evmAddress } = useEvmAddress()
   const { isSignedIn } = useIsSignedIn()
   const { signEvmMessage } = useSignEvmMessage()
   const [testMessage, setTestMessage] = useState('')
   const [isSigning, setIsSigning] = useState(false)
 
   const handleSignMessage = () => {
     if (!testMessage.trim()) return
     if (!evmAddress) return
     setIsSigning(true)
     Promise.resolve()
       .then(async () => {
         const result: any = await signEvmMessage({
           evmAccount: evmAddress,
           message: testMessage,
         })
         const sig = typeof result === 'string' ? result : result?.signature ?? ''
         alert(`Message signed! Signature: ${sig ? `${sig.slice(0, 20)}...` : 'Success'}`)
         setTestMessage('')
       })
       .catch((error) => {
         console.error('Failed to sign message:', error)
       })
       .finally(() => setIsSigning(false))
   }
 
   const chainId = 8453
 
   return (
     <div className="container mx-auto px-4 py-8 max-w-4xl">
       <div className="mb-8">
         <h1 className="text-3xl font-bold mb-2">VoteChain Wallet Demo</h1>
         <p className="text-muted-foreground">Test Coinbase embedded wallet integration</p>
       </div>
 
       <div className="grid gap-6">
         <Card>
           <CardHeader>
             <CardTitle>Wallet Status</CardTitle>
             <CardDescription>Current wallet connection state</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span>Signed In:</span>
                 <span className={isSignedIn ? 'text-green-600' : 'text-red-600'}>
                   {isSignedIn ? '✓ Yes' : '✗ No'}
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span>EVM Address:</span>
                 <span className="text-sm font-mono">
                   {evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : 'None'}
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span>Preferred Network:</span>
                 <span>Base (chainId {chainId})</span>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader>
             <CardTitle>Wallet Sign In</CardTitle>
             <CardDescription>Use Coinbase embedded wallet</CardDescription>
           </CardHeader>
           <CardContent>
             <AuthButton />
           </CardContent>
         </Card>
 
         {isSignedIn && (
           <Card>
             <CardHeader>
               <CardTitle>Test Wallet Functions</CardTitle>
               <CardDescription>Test signing messages and other wallet functionality</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Input
                   placeholder="Enter message to sign..."
                   value={testMessage}
                   onChange={(e) => setTestMessage(e.target.value)}
                 />
                 <Button onClick={handleSignMessage} disabled={!testMessage.trim() || isSigning}>
                   {isSigning ? 'Signing...' : 'Sign Message'}
                 </Button>
               </div>
 
               <div className="text-sm text-muted-foreground">
                 <p>This will prompt your wallet to sign the message above.</p>
               </div>
             </CardContent>
           </Card>
         )}
 
         <Card>
           <CardHeader>
             <CardTitle>Getting Started</CardTitle>
             <CardDescription>How to use VoteChain with your wallet</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-3 text-sm">
               <div className="flex items-start gap-2">
                 <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">1</span>
                 <p>Sign in using the button above</p>
               </div>
               <div className="flex items-start gap-2">
                 <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">2</span>
                 <p>Create topics and vote on community proposals</p>
               </div>
               <div className="flex items-start gap-2">
                 <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">3</span>
                 <p>All votes are recorded transparently on the blockchain</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {isSignedIn && (
           <Card>
             <CardHeader>
               <CardTitle>Network Information</CardTitle>
               <CardDescription>Current blockchain network details</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span>Chain ID:</span>
                   <span className="font-mono">{chainId}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Network:</span>
                   <span>
                     {chainId === 1 && 'Ethereum Mainnet'}
                     {chainId === 8453 && 'Base Mainnet'}
                     {chainId === 84532 && 'Base Sepolia'}
                     {chainId && ![1, 8453, 84532].includes(chainId) && 'Unknown Network'}
                   </span>
                 </div>
                 <div className="text-xs text-muted-foreground mt-2">
                   VoteChain works best on Base network for lower fees
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
       </div>
     </div>
   )
 }
