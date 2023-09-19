import { Fees } from "opensea-js/lib/types"
import { sdkClient } from "./apiClient"
import { getNetwork } from "./network"
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
const getOffer = (tokenId: string) => {
  return [
    {
      // itemType: 1, // ERC 20
      itemType: 2, // the offer array must have exactly one item, and it must be an ERC721 or ERC1155 token.
      token: network.itemAssetContractAddress, // nft contract address
      identifierOrCriteria: tokenId,
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


// Get consideration for an item token
const getItemTokenConsideration = async (
  price: bigint,
) => {
  const offerer = getOfferer()
  return {
    itemType: 0,
    token: "0x0000000000000000000000000000000000000000",
    identifierOrCriteria: 0,
    startAmount: price.toString(),
    endAmount: price.toString(),
    recipient: offerer,
  }
}


const getItemConsideration = async (
  assetContractAddress: string,
  tokenId: string,
  priceWei: bigint,
) => {
  const fees = [
    await getItemTokenConsideration(priceWei),
    ...(await getItemFees(assetContractAddress, tokenId, priceWei)),
  ]

  return fees
}

// Generate a random salt value
const getSalt = () => {
  return Math.floor(Math.random() * 100_000).toString()
}

// Define the structure for an item offer specification
type ItemOfferSpecification = {
  assetContractAddress: string
  tokenId: string
  priceWei: bigint
  expirationSeconds: bigint
}

// for more info on the listing structure, see https://docs.opensea.io/reference/create-an-order
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

  // update the price for the first fee, which is the amount the seller will receive
  let priceStartAmount = BigInt(priceWei)
  for (let i = 1; i < consideration.length; i++) {
    priceStartAmount = priceStartAmount - BigInt(consideration[i].startAmount)
  }
  let priceEndAmount = BigInt(priceWei)
  for (let i = 1; i < consideration.length; i++) {
    priceEndAmount = priceEndAmount - BigInt(consideration[i].endAmount)
  }
  consideration[0].startAmount = priceStartAmount.toString()
  consideration[0].endAmount = priceEndAmount.toString()

  const offer = {
    offerer: getOfferer(),
    offer: getOffer(tokenId),
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
