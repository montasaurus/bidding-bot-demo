import { Chain, Fees } from "opensea-js/lib/types"
import { apiClient, sdkClient } from "./apiClient"
import { getNetwork } from "./network"
import { seaportContractAddress } from "./seaport"
import { getWallet } from "./wallet"

const network = getNetwork()

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

// Create listing item for an offer
const getOffer = (priceWei: bigint, tokenId: string) => {
  return [
    {
      // itemType: 1, // ERC 20
      itemType: 2, // the offer array must have exactly one item, and it must be an ERC721 or ERC1155 token.
      token: network.itemAssetContractAddress, // nft contract address
      identifierOrCriteria: tokenId,
      // startAmount: priceWei.toString(),
      // endAmount: priceWei.toString(),
      startAmount: '1',
      endAmount: '1',
    },
  ]
}

// Fee item for an offer
const getFee = (
  priceWei: bigint,
  feeBasisPoints: bigint,
  recipient: string,
): Consideration | null => {
  const fee = (priceWei * feeBasisPoints) / BigInt(10000)
  if (fee <= 0) {
    return null
  }
  return {
    itemType: 0, 
    token: "0x0000000000000000000000000000000000000000",
    identifierOrCriteria: 0,
    startAmount: fee.toString(),
    endAmount: fee.toString(),
    recipient: recipient,
  }
}

// Extract fees from an API response
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

// Extract fees from an SDK response
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

// Get item fees / considerations, from OpenSea's SDK
const getItemFees = async (
  assetContractAddress: string,
  tokenId: string,
  priceWei: bigint,
) => {
  const response = await sdkClient.api.getNFT(
    network.network,
    assetContractAddress,
    tokenId,
  )

  const collectionSlug = response.nft.collection
  const collection = await sdkClient.api.getCollection(collectionSlug)
  const fees = collection.fees
  const feesUpdated = extractFeesSdk(fees, priceWei)
  return feesUpdated
}

// Get criteria fees from an API
const getCriteriaFees = async (collectionSlug: string, priceWei: bigint) => {
  const response = await apiClient.get(`v1/collection/${collectionSlug}`)

  const feesObject = response.data.collection.fees
  return extractFeesApi(feesObject, priceWei)
}

// Get build data for an offer
const getBuildData = async (collectionSlug: string, quantity: number) => {
  const offerer = getOfferer()
  const response = await apiClient.post("v2/offers/build", {
    offerer,
    quantity,
    criteria: {
      collection: {
        slug: collectionSlug,
      },
    },
    protocol_address: seaportContractAddress,
  })

  return response.data.partialParameters
}

// Get consideration for an item token
const getItemTokenConsideration = async (
  assetContractAddress: string,
  tokenId: string,
  price: bigint,
) => {
  const newPrice = price / BigInt(20) * BigInt(19); // Use 'n' suffix to indicate BigInt literals
  // const newprice = price /20*19
  const offerer = getOfferer()
  return {
    itemType: 0,
    token: "0x0000000000000000000000000000000000000000",
    identifierOrCriteria: 0,
    startAmount: newPrice.toString(),
    endAmount: newPrice.toString(),
    recipient: offerer,
  }
}

const getCriteriaConsideration = async (
  criteriaFees: unknown[],
  collectionSlug: string,
  priceWei: bigint,
) => {
  const fees = [
    ...criteriaFees,
    ...(await getCriteriaFees(collectionSlug, priceWei)),
  ]

  return fees.filter(fee => fee !== null)
}

const getItemConsideration = async (
  assetContractAddress: string,
  tokenId: string,
  priceWei: bigint,
) => {
  const fees = [
    await getItemTokenConsideration(assetContractAddress, tokenId, priceWei),
    ...(await getItemFees(assetContractAddress, tokenId, priceWei)),
  ]

  return fees
}

// Generate a random salt value
const getSalt = () => {
  return Math.floor(Math.random() * 100_000).toString()
}

// Define the structure for a collection offer specification
type CollectionOfferSpecification = {
  collectionSlug: string
  quantity: number
  priceWei: bigint
  expirationSeconds: bigint
}

// Define the structure for an item offer specification
type ItemOfferSpecification = {
  assetContractAddress: string
  tokenId: string
  priceWei: bigint
  expirationSeconds: bigint
}

export const buildItemListing = async (
  offerSpecification: ItemOfferSpecification,
) => {
  const {
    assetContractAddress,
    tokenId,
    priceWei,
    expirationSeconds,
  } = offerSpecification

  const now = BigInt(Math.floor(Date.now() / 1000))
  const startTime = now.toString()
  const endTime = (now + expirationSeconds).toString()
  const consideration = await getItemConsideration(
    assetContractAddress,
    tokenId,
    priceWei,
  )
  // TODO we need to update the price for the item: 
  // subtract the fees from the initial price, as they are set as a % of the initial price
  // TEMPORARY FIX: subtract 5% = 2.5% (SC creator fee) + 2.5% opensea, but this needs to be checked
  console.log("... buildItemListing: We apply a temporary fix here for the consideration")

  const offer = {
    offerer: getOfferer(),
    offer: getOffer(priceWei,tokenId),
    consideration,
    startTime,
    endTime,
    orderType: 0,
    zone: "0x0000000000000000000000000000000000000000",
    zoneHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    salt: getSalt(),
    conduitKey,
    totalOriginalConsiderationItems: consideration.length.toString(),
    counter: 0,
  }

  return offer
}
