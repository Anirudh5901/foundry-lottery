"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../config/wagmi";
import ConnectWallet from "../components/ConnectWallet";
import RaffleContainer from "../components/RaffleContainer";
import { TypewriterEffectSmooth } from "../components/ui/typewriter-effect";
import { BackgroundBeams } from "../components/ui/background-beams";
// Create a client for React Query
const queryClient = new QueryClient();

const words = [
  {
    text: "Enter",
  },
  {
    text: "the",
  },
  {
    text: "raffle",
  },
  {
    text: "for",
  },
  {
    text: "a",
  },
  {
    text: "chance",
  },
  {
    text: "to",
  },
  {
    text: "win",
  },
  {
    text: "the",
  },
  {
    text: "the",
  },
  {
    text: "entire",
  },
  {
    text: "pool !",
    className: "text-blue-500 dark:text-blue-500",
  },
];

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="min-h-screen flex flex-col items-center p-3 bg-gradient-to-br from-gray-900 to-black text-white">
          <h1 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-1 md:py-8 relative z-20 font-bold tracking-tight">
            Decentralized Lottery
          </h1>
          <div className="text-lg mb-8 text-center max-w-full z-10">
            <TypewriterEffectSmooth words={words} />
          </div>

          <div className="w-full max-w-3xl z-10">
            <ConnectWallet />
            <RaffleContainer />
          </div>

          <footer className="mt-16 text-sm text-gray-400 z-10">
            Built with Next.js, TypeScript, Wagmi, and Solidity
          </footer>
          <BackgroundBeams />
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
