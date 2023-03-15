import { AxiosError } from "axios"
import { ethers } from "ethers"
import { apiClient } from "./apiClient"
import { getNetwork } from "./network"
import { seaportContractAddress, seaportInterface } from "./seaport"
import { getWallet } from "./wallet"

const network = getNetwork()

const getFulfillmentData = async (
  offerHash: string,
  fulfillerAddress: string,
) => {
  const payload = {
    offer: {
      hash: offerHash,
      chain: network.chainName,
      protocol_address: seaportContractAddress,
    },
    fulfiller: {
      address: fulfillerAddress,
    },
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

type FulfillmentRequest = {
  offerHash: string
  fulfillerAddress?: string
}

const buildTransaction = async (request: FulfillmentRequest) => {
  const fulfillerAddress = request.fulfillerAddress || getWallet().address
  const fulfillmentData = await getFulfillmentData(
    request.offerHash,
    fulfillerAddress,
  )
  const transactionData = fulfillmentData.transaction

  const fragment = seaportInterface.getFunction(transactionData.function)
  const encodedData = seaportInterface.encodeFunctionData(fragment, [
    transactionData.input_data.parameters,
  ])
  const tx: ethers.providers.TransactionRequest = {
    to: transactionData.to,
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
