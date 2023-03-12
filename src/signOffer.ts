import { getNetwork } from "./network"
import { getWallet } from "./wallet"

const types = {
  OrderComponents: [
    {
      name: "offerer",
      type: "address",
    },
    {
      name: "zone",
      type: "address",
    },
    {
      name: "offer",
      type: "OfferItem[]",
    },
    {
      name: "consideration",
      type: "ConsiderationItem[]",
    },
    {
      name: "orderType",
      type: "uint8",
    },
    {
      name: "startTime",
      type: "uint256",
    },
    {
      name: "endTime",
      type: "uint256",
    },
    {
      name: "zoneHash",
      type: "bytes32",
    },
    {
      name: "salt",
      type: "uint256",
    },
    {
      name: "conduitKey",
      type: "bytes32",
    },
    {
      name: "counter",
      type: "uint256",
    },
  ],
  OfferItem: [
    {
      name: "itemType",
      type: "uint8",
    },
    {
      name: "token",
      type: "address",
    },
    {
      name: "identifierOrCriteria",
      type: "uint256",
    },
    {
      name: "startAmount",
      type: "uint256",
    },
    {
      name: "endAmount",
      type: "uint256",
    },
  ],
  ConsiderationItem: [
    {
      name: "itemType",
      type: "uint8",
    },
    {
      name: "token",
      type: "address",
    },
    {
      name: "identifierOrCriteria",
      type: "uint256",
    },
    {
      name: "startAmount",
      type: "uint256",
    },
    {
      name: "endAmount",
      type: "uint256",
    },
    {
      name: "recipient",
      type: "address",
    },
  ],
}

const network = getNetwork()

const domain = {
  name: "Seaport",
  version: "1.4",
  chainId: network.chainId,
  verifyingContract: "0x00000000000001ad428e4906aE43D8F9852d0dD6",
}

export const signOffer = async (offer: Record<string, unknown>) => {
  const wallet = getWallet()
  return await wallet._signTypedData(domain, types, offer)
}
