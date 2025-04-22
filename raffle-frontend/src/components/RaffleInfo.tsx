"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { RaffleAbi } from "../constants/constants";

const RAFFLE_CONTRACT_ADDRESS = "0x980b222e16d578806FD7c1BCE7A0BEbc231F59e2";

export default function RaffleInfo() {
  const [raffleState, setRaffleState] = useState<string>("Loading...");
  const [timeRemaining, setTimeRemaining] = useState<string>("Calculating...");

  // Read entrance fee
  const { data: entranceFee } = useReadContract({
    address: RAFFLE_CONTRACT_ADDRESS,
    abi: RaffleAbi,
    functionName: "getEntranceFee",
  });

  // Read raffle state
  const { data: raffleStateData } = useReadContract({
    address: RAFFLE_CONTRACT_ADDRESS,
    abi: RaffleAbi,
    functionName: "getRaffleState",
  });

  // Read last timestamp
  const { data: lastTimeStamp } = useReadContract({
    address: RAFFLE_CONTRACT_ADDRESS,
    abi: RaffleAbi,
    functionName: "getLastTimeStamp",
  });

  // Read recent winner
  const { data: recentWinner } = useReadContract({
    address: RAFFLE_CONTRACT_ADDRESS,
    abi: RaffleAbi,
    functionName: "getRecentWinner",
  });

  // Format the address to show a shorter version
  const formatAddress = (addr: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") {
      return "No winner yet";
    }
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Update raffle state display
  useEffect(() => {
    if (raffleStateData !== undefined) {
      setRaffleState(Number(raffleStateData) === 0 ? "OPEN" : "CALCULATING");
    }
  }, [raffleStateData]);

  // Update countdown timer
  useEffect(() => {
    if (!lastTimeStamp) return;

    const interval = setInterval(() => {
      // Assuming i_interval is 30 days (in seconds)
      const intervalInSeconds = 30 * 24 * 60 * 60;
      const nextDrawTime = Number(lastTimeStamp) + intervalInSeconds;
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = nextDrawTime - currentTime;

      if (remainingTime <= 0) {
        setTimeRemaining("Drawing should occur soon!");
        return;
      }

      const days = Math.floor(remainingTime / (24 * 60 * 60));
      const hours = Math.floor((remainingTime % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
      const seconds = remainingTime % 60;

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastTimeStamp]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Raffle Information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1">Entry Fee</div>
          <div className="font-medium">
            {entranceFee
              ? `${formatEther(entranceFee as bigint)} ETH`
              : "Loading..."}
          </div>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1">Raffle State</div>
          <div className="font-medium">
            {raffleState === "OPEN" ? (
              <span className="text-green-400">OPEN</span>
            ) : raffleState === "CALCULATING" ? (
              <span className="text-yellow-400">CALCULATING</span>
            ) : (
              raffleState
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1">Time Remaining</div>
          <div className="font-medium">{timeRemaining}</div>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1">Recent Winner</div>
          <div className="font-mono">
            {recentWinner
              ? formatAddress(recentWinner as string)
              : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
}
