import raffleAbi from "./Raffle.json";

export const RaffleAbi = raffleAbi.abi;

// Chain IDs
export const CHAIN_ID_SEPOLIA = 11155111;
export const CHAIN_ID_LOCAL = 31337;

// Contract addresses based on chains
type ContractAddresses = {
  [chainId: number]: string;
};

export const RAFFLE_CONTRACT_ADDRESSES: ContractAddresses = {
  [CHAIN_ID_SEPOLIA]: "0x980b222e16d578806FD7c1BCE7A0BEbc231F59e2", // Replace with your deployed contract address on Sepolia
  [CHAIN_ID_LOCAL]: "0x...", // Replace with your local deployment address
};

// Helper function to get the correct contract address based on the current chain
export function getRaffleContractAddress(chainId: number): string {
  return (
    RAFFLE_CONTRACT_ADDRESSES[chainId] ||
    RAFFLE_CONTRACT_ADDRESSES[CHAIN_ID_SEPOLIA]
  );
}
