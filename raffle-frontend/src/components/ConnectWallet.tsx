"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  // Local state to track connection status, initialized to false (server default)
  const [isConnectedState, setIsConnectedState] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  // Sync local state with actual connection status after mount
  useEffect(() => {
    setIsConnectedState(isConnected);
  }, [isConnected]);

  // Format the address to show a shorter version
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnectedState) {
    return (
      <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400">Connected:</span>
            <span className="ml-2 font-mono">
              {address ? formatAddress(address) : "Loading..."}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
      <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition-colors w-full font-medium"
        >
          {isPending ? "Connecting..." : "Connect Wallet"}
        </button>

        {isDropdownOpen && (
          <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setIsDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
              >
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 text-red-400 text-sm">Error: {error.message}</div>
      )}
    </div>
  );
}
