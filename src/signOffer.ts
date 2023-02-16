import { getNetwork } from "./network"
import { getWallet } from "./wallet"

const types = {
  //   EIP712Domain: [
  //     {
  //       name: "name",
  //       type: "string",
  //     },
  //     {
  //       name: "version",
  //       type: "string",
  //     },
  //     {
  //       name: "chainId",
  //       type: "uint256",
  //     },
  //     {
  //       name: "verifyingContract",
  //       type: "address",
  //     },
  //   ],
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
  version: "1.1",
  chainId: network.chainId,
  verifyingContract: "0x00000000006c3852cbEf3e08E8dF289169EdE581",
}

export const signOffer = async (offer: Record<string, unknown>) => {
  const wallet = getWallet()
  return await wallet._signTypedData(domain, types, offer)
}
