import { createConfig, http } from "wagmi";
import { Chain } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const anvilChain: Chain = {
  id: 31337,
  name: "Anvil",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
    public: { http: ["http://localhost:8545"] },
  },
};

// Placeholder for Tenderly chain; update later with actual values
export const tenderlyChain: Chain = {
  id: 11155111, // Replace with Tenderly chain ID
  name: "Tenderly",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        "https://virtual.sepolia.rpc.tenderly.co/6ab481d8-c964-4a8d-9d4a-1cfd06d82442",
      ],
    }, // Replace with Tenderly RPC URL
    public: { http: [""] }, // Replace with Tenderly RPC URL
  },
};

export const config = createConfig({
  chains: [anvilChain], // Add tenderlyChain later
  connectors: [
    metaMask(), // Add MetaMask connector
  ],
  transports: {
    [anvilChain.id]: http(),
    [tenderlyChain.id]: http(), // Uncomment when deploying to Tenderly
  },
});
