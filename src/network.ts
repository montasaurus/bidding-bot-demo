const networks = {
  mainnet: {
    chainId: 1,
    baseURL: "https://api.opensea.io/api/",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    zone: "0x004c00500000ad104d7dbd00e3ae0a5c00560c00",
  },
  testnet: {
    chainId: 5,
    baseURL: "https://testnets-api.opensea.io/api/",
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    zone: "0x00000000e88fe2628ebc5da81d2b3cead633e89e",
  },
}

export const getNetwork = () => {
  const network = process.env.NETWORK
  switch (network) {
    case "mainnet":
      return networks.mainnet
    case "testnet":
      return networks.testnet
    default:
      throw `Invalid network found in .env. Please add "NETWORK=mainnet" or "NETWORK=testnet" to your .env file.`
  }
}
