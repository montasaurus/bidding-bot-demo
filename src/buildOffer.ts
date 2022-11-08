import { apiClient } from "./apiClient"
import { getWallet } from "./wallet"

const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
const openSeaFeeRecipient = "0x0000a26b00c1F0DF003000390027140000fAa719"
const zone = "0x00000000e88fe2628ebc5da81d2b3cead633e89e"
const zoneHash =
  "0x0000000000000000000000000000000000000000000000000000000000000000"
const conduitKey =
  "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000"

const getOfferer = () => {
  const wallet = getWallet()
  return wallet.address
}

const getOffer = (priceWei: bigint) => {
  return [
    {
      itemType: "1", // ERC 20
      token: wethAddress, // WETH
      identifierOrCriteria: 0,
      startAmount: priceWei.toString(),
      endAmount: priceWei.toString(),
    },
  ]
}

const getPlatformFee = (priceWei: bigint) => {
  const feeBasisPoints = BigInt(250)
  const fee = (priceWei * feeBasisPoints) / BigInt(10000)
  return {
    itemType: 1, // ERC 20
    token: wethAddress,
    identifierOrCriteria: 0,
    startAmount: fee.toString(),
    endAmount: fee.toString(),
    recipient: openSeaFeeRecipient, // OS Recipient
  }
}
const getCreatorFee = (
  priceWei: bigint,
  basisPoints: bigint,
  receipient: string,
) => {
  const fee = (priceWei * basisPoints) / BigInt(10000)
  return {
    itemType: 1, // ERC 20
    token: wethAddress,
    identifierOrCriteria: 0,
    startAmount: fee.toString(),
    endAmount: fee.toString(),
    recipient: receipient,
  }
}

const getTokenConsideration = async (
  collectionSlug: string,
  quantity: number,
) => {
  const offerer = getOfferer()
  const response = await apiClient.post("v2/offers/build", {
    offerer,
    quantity,
    criteria: {
      collection: {
        slug: collectionSlug,
      },
    },
  })

  return response.data.partialParameters.consideration[0]
}

const getConsideration = async (
  collectionSlug: string,
  quantity: number,
  priceWei: bigint,
  creatorBasisPoints: bigint,
  creatorFeeRecipient: string,
) => {
  return [
    await getTokenConsideration(collectionSlug, quantity),
    getPlatformFee(priceWei),
    getCreatorFee(priceWei, creatorBasisPoints, creatorFeeRecipient),
  ]
}

const getSalt = () => {
  return Math.floor(Math.random() * 100_000).toString()
}

type OfferSpecification = {
  collectionSlug: string
  quantity: number
  priceWei: bigint
  creatorBasisPoints: bigint
  creatorFeeRecipient: string
  expirationSeconds: bigint
}

export const buildOffer = async (offerSpecification: OfferSpecification) => {
  const {
    collectionSlug,
    quantity,
    priceWei,
    creatorBasisPoints,
    creatorFeeRecipient,
    expirationSeconds,
  } = offerSpecification

  const now = BigInt(Math.floor(Date.now() / 1000))
  const startTime = now.toString()
  const endTime = (now + expirationSeconds).toString()
  const consideration = await getConsideration(
    collectionSlug,
    quantity,
    priceWei,
    creatorBasisPoints,
    creatorFeeRecipient,
  )

  const offer = {
    offerer: getOfferer(),
    offer: getOffer(priceWei),
    consideration,
    startTime,
    endTime,
    orderType: 2, // ERC 721 Criteria Order
    zone,
    zoneHash,
    salt: getSalt(),
    conduitKey,
    totalOriginalConsiderationItems: consideration.length.toString(),
    counter: 0,
  }

  return offer
}
