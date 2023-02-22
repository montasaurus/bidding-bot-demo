/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Network } from "opensea-js"

const networks = {
  mainnet: {
    chainId: 1,
    chainName: "ethereum",
    baseURL: "https://api.opensea.io/api/",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    zone: "0x004c00500000ad104d7dbd00e3ae0a5c00560c00",
    apiKey: process.env.API_KEY!,
    rpcUrl: process.env.MAINNET_RPC_URL!,
    network: Network.Main,
  },
  testnets: {
    chainId: 5,
    chainName: "goerli",
    baseURL: "https://testnets-api.opensea.io/api/",
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    zone: "0x00000000e88fe2628ebc5da81d2b3cead633e89e",
    apiKey: undefined,
    rpcUrl: process.env.TESTNETS_RPC_URL!,
    network: Network.Goerli,
  },
}

export const getNetwork = () => {
  const network = process.env.NETWORK
  switch (network) {
    case "mainnet":
      return networks.mainnet
    case "testnets":
      return networks.testnets
    default:
      throw `Invalid network found in .env. Please add "NETWORK=mainnet" or "NETWORK=testnets" to your .env file.`
  }
}
