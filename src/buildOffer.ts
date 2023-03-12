import { Fees } from "opensea-js/lib/types"
import { apiClient, sdkClient } from "./apiClient"
import { getNetwork } from "./network"
import { getWallet } from "./wallet"

const network = getNetwork()

const zoneHash =
  "0x0000000000000000000000000000000000000000000000000000000000000000"
const conduitKey =
  "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000"

type Consideration = {
  itemType: number
  token: string
  identifierOrCriteria: string | number
  startAmount: string | number
  endAmount: string | number
  recipient: string
}

const getOfferer = () => {
  const wallet = getWallet()
  return wallet.address
}

const getOffer = (priceWei: bigint) => {
  return [
    {
      itemType: 1, // ERC 20
      token: network.wethAddress,
      identifierOrCriteria: 0,
      startAmount: priceWei.toString(),
      endAmount: priceWei.toString(),
    },
  ]
}

const getFee = (
  priceWei: bigint,
  feeBasisPoints: bigint,
  receipient: string,
): Consideration | null => {
  const fee = (priceWei * feeBasisPoints) / BigInt(10000)
  if (fee <= 0) {
    return null
  }
  return {
    itemType: 1, // ERC 20
    token: network.wethAddress,
    identifierOrCriteria: 0,
    startAmount: fee.toString(),
    endAmount: fee.toString(),
    recipient: receipient,
  }
}

const extractFeesApi = (feesObject: object, priceWei: bigint) => {
  const fees = []

  for (const [_category, categoryFees] of Object.entries(feesObject)) {
    for (const [address, basisPoints] of Object.entries(categoryFees)) {
      const fee = getFee(priceWei, BigInt(basisPoints as number), address)
      if (fee) {
        fees.push(fee)
      }
    }
  }

  return fees
}

const extractFeesSdk = (feesObject: Fees, priceWei: bigint) => {
  const fees = []
  const feesToAdd = [...feesObject.openseaFees, ...feesObject.sellerFees]

  for (const [address, basisPoints] of feesToAdd) {
    const fee = getFee(priceWei, BigInt(basisPoints), address)
    if (fee) {
      fees.push(fee)
    }
  }

  return fees
}

const getItemFees = async (
  assetContractAddress: string,
  tokenId: string,
  priceWei: bigint,
) => {
  const asset = await sdkClient.api.getAsset({
    tokenAddress: assetContractAddress,
    tokenId,
  })

  const fees = asset.collection.fees
  return extractFeesSdk(fees, priceWei)
}

const getCriteriaFees = async (collectionSlug: string, priceWei: bigint) => {
  const response = await apiClient.get(`v1/collection/${collectionSlug}`)

  const feesObject = response.data.collection.fees
  return extractFeesApi(feesObject, priceWei)
}

const getCriteriaTokenConsideration = async (
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

const getItemTokenConsideration = async (
  assetContractAddress: string,
  tokenId: string,
  quantity: number,
) => {
  const offerer = getOfferer()
  return {
    itemType: 2,
    token: assetContractAddress,
    identifierOrCriteria: tokenId,
    startAmount: quantity,
    endAmount: quantity,
    recipient: offerer,
  }
}

const getCriteriaConsideration = async (
  collectionSlug: string,
  quantity: number,
  priceWei: bigint,
) => {
  const fees = [
    await getCriteriaTokenConsideration(collectionSlug, quantity),
    ...(await getCriteriaFees(collectionSlug, priceWei)),
  ]

  return fees.filter(fee => fee !== null)
}

const getItemConsideration = async (
  assetContractAddress: string,
  tokenId: string,
  quantity: number,
  priceWei: bigint,
) => {
  const fees = [
    await getItemTokenConsideration(assetContractAddress, tokenId, quantity),
    ...(await getItemFees(assetContractAddress, tokenId, priceWei)),
  ]

  return fees
}

const getSalt = () => {
  return Math.floor(Math.random() * 100_000).toString()
}

type CollectionOfferSpecification = {
  collectionSlug: string
  quantity: number
  priceWei: bigint
  expirationSeconds: bigint
}

type ItemOfferSpecification = {
  assetContractAddress: string
  tokenId: string
  quantity: number
  priceWei: bigint
  expirationSeconds: bigint
}

export const buildCollectionOffer = async (
  offerSpecification: CollectionOfferSpecification,
) => {
  const { collectionSlug, quantity, priceWei, expirationSeconds } =
    offerSpecification

  const now = BigInt(Math.floor(Date.now() / 1000))
  const startTime = now.toString()
  const endTime = (now + expirationSeconds).toString()
  const consideration = await getCriteriaConsideration(
    collectionSlug,
    quantity,
    priceWei,
  )

  const offer = {
    offerer: getOfferer(),
    offer: getOffer(priceWei),
    consideration,
    startTime,
    endTime,
    orderType: 0,
    zone: network.zone,
    zoneHash,
    salt: getSalt(),
    conduitKey,
    totalOriginalConsiderationItems: consideration.length.toString(),
    counter: 0,
  }

  return offer
}

export const buildItemOffer = async (
  offerSpecification: ItemOfferSpecification,
) => {
  const {
    assetContractAddress,
    tokenId,
    quantity,
    priceWei,
    expirationSeconds,
  } = offerSpecification

  const now = BigInt(Math.floor(Date.now() / 1000))
  const startTime = now.toString()
  const endTime = (now + expirationSeconds).toString()
  const consideration = await getItemConsideration(
    assetContractAddress,
    tokenId,
    quantity,
    priceWei,
  )

  const offer = {
    offerer: getOfferer(),
    offer: getOffer(priceWei),
    consideration,
    startTime,
    endTime,
    orderType: 0,
    zone: network.zone,
    zoneHash,
    salt: getSalt(),
    conduitKey,
    totalOriginalConsiderationItems: consideration.length.toString(),
    counter: 0,
  }

  return offer
}
