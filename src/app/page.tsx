import HomeClient from "@/components/HomeClient";
import Providers from "@/context/coinbase-provider";

export default function Home() {
  return (
    <Providers>
      <HomeClient />
    </Providers>
  );
}
