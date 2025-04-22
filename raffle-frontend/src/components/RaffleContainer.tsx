"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import RaffleInfo from "./RaffleInfo";
import RaffleEntrance from "./RaffleEntrance";

export default function RaffleContainer() {
  const { isConnected } = useAccount();
  const [isConnectedState, setIsConnectedState] = useState(false);

  // Sync local state with actual connection status after mount
  useEffect(() => {
    setIsConnectedState(isConnected);
  }, [isConnected]);

  return (
    <div className="space-y-6">
      <RaffleInfo />
      {isConnectedState ? (
        <RaffleEntrance />
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
          <p className="text-gray-400">
            Connect your wallet to enter the raffle
          </p>
        </div>
      )}
    </div>
  );
}
