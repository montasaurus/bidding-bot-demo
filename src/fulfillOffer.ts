import { AxiosError } from "axios"
import { ethers } from "ethers"
import { apiClient } from "./apiClient"
import { getNetwork } from "./network"
import { seaportContractAddress, seaportInterface } from "./seaport"
import { getWallet } from "./wallet"

const network = getNetwork()

type NFT = {
  assetContractAddress: string
  tokenId: string
}

type FulfillmentRequest = {
  offerHash: string
  fulfillerAddress: string
  consideration?: NFT
}

const getFulfillmentData = async (request: FulfillmentRequest) => {
  let consideration
  if (request.consideration) {
    consideration = {
      asset_contract_address: request.consideration.assetContractAddress,
      token_id: request.consideration.tokenId,
    }
  }
  const payload = {
    offer: {
      hash: request.offerHash,
      chain: network.chainName,
      protocol_address: seaportContractAddress,
    },
    fulfiller: {
      address: request.fulfillerAddress,
    },
    consideration,
  }

  try {
    const response = await apiClient.post(`v2/offers/fulfillment_data`, payload)
    return response.data.fulfillment_data
  } catch (error) {
    console.error("request failed to fulfillOffer")
    console.error((error as AxiosError).response?.data)
    throw error
  }
}

const buildTransaction = async (request: FulfillmentRequest) => {
  const fulfillmentData = await getFulfillmentData(request)
  const transactionData = fulfillmentData.transaction

  const fragment = seaportInterface.getFunction(transactionData.function)
  const encodedData = seaportInterface.encodeFunctionData(
    fragment,
    Object.values(transactionData.input_data),
  )
  const tx: ethers.providers.TransactionRequest = {
    to: transactionData.to,
    from: request.fulfillerAddress,
    value: transactionData.value,
    data: encodedData,
  }

  return tx
}

export const estimateFulfillOfferGas = async (request: FulfillmentRequest) => {
  const transaction = await buildTransaction(request)
  transaction.maxPriorityFeePerGas = 0 // to make the estimate work if eth is low

  const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)
  return await provider.estimateGas(transaction)
}

// Sample of how to actually fulfill an offer
const _fulfillTransaction = async (offerHash: string) => {
  const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)
  const wallet = getWallet().connect(provider)

  const transaction = await buildTransaction({
    offerHash,
    fulfillerAddress: wallet.address,
  })

  return await wallet.sendTransaction(transaction)
}
