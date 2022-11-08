import { Wallet } from "ethers"
export const getWallet = () => {
  const privateKey = process.env.WALLET_PRIVATE_KEY
  if (privateKey === undefined) {
    throw new Error("No private key found in .env")
  }
  return new Wallet(privateKey)
}
