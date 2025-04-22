"use client";

import { useState } from "react";
import { parseEther } from "viem";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { RaffleAbi } from "../constants/constants";

const RAFFLE_CONTRACT_ADDRESS = "0x980b222e16d578806FD7c1BCE7A0BEbc231F59e2";

export default function RaffleEntrance() {
  const [isEntering, setIsEntering] = useState(false);

  // Get entrance fee
  const { data: entranceFee } = useReadContract({
    address: RAFFLE_CONTRACT_ADDRESS,
    abi: RaffleAbi,
    functionName: "getEntranceFee",
  });

  // Get raffle state
  const { data: raffleStateData } = useReadContract({
    address: RAFFLE_CONTRACT_ADDRESS,
    abi: RaffleAbi,
    functionName: "getRaffleState",
  });

  // Setup contract write function
  const { data: hash, writeContract, error, isPending } = useWriteContract();

  // Setup transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Check if raffle is open
  const isRaffleOpen =
    raffleStateData !== undefined && Number(raffleStateData) === 0;

  // Handle enter raffle button click
  const handleEnterRaffle = async () => {
    if (!entranceFee || !isRaffleOpen) return;

    try {
      setIsEntering(true);
      await writeContract({
        address: RAFFLE_CONTRACT_ADDRESS,
        abi: RaffleAbi,
        functionName: "enterRaffle",
        value: entranceFee as bigint,
      });
    } catch (err) {
      console.error("Error entering raffle:", err);
    } finally {
      setIsEntering(false);
    }
  };

  // Get status message
  const getStatusMessage = () => {
    if (isPending || isEntering) return "Processing...";
    if (isConfirming) return "Confirming transaction...";
    if (isConfirmed) return "Successfully entered the raffle!";
    if (error) return `Error: ${error.message}`;
    return "";
  };

  // Status message styling
  const getStatusClass = () => {
    if (isConfirmed) return "text-green-400";
    if (error) return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Enter the Raffle</h2>

      <div className="mb-6">
        <p className="text-gray-300">
          Ready to try your luck? Enter the raffle by clicking the button below!
        </p>
        {entranceFee ? (
          <p className="mt-2 text-gray-400">
            Entrance fee: {parseEther(String(entranceFee as bigint)).toString()}{" "}
            ETH
          </p>
        ) : (
          ""
        )}
      </div>

      <button
        onClick={handleEnterRaffle}
        disabled={!isRaffleOpen || isPending || isConfirming || isEntering}
        className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
          !isRaffleOpen || isPending || isConfirming || isEntering
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isPending || isConfirming || isEntering
          ? "Processing..."
          : !isRaffleOpen
          ? "Raffle is currently closed"
          : "Enter Raffle"}
      </button>

      {getStatusMessage() && (
        <div className={`mt-4 ${getStatusClass()}`}>{getStatusMessage()}</div>
      )}
    </div>
  );
}
