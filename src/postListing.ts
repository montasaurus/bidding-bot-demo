import { apiClient } from "./apiClient"
import { getNetwork } from "./network"
import { seaportContractAddress } from "./seaport"

const network = getNetwork()

export const postItemListing = async (offer: unknown, signature: string) => {
  const payload = {
    parameters: offer,
    signature,
    protocol_address: seaportContractAddress,
  }
  return await apiClient
    .post(`v2/orders/${network.network}/seaport/listings`, payload)
    .then(response => {
      return response.data
    })
    .catch(function (error) {
      console.log("... postitemListing: error: ")
      console.error(error.response.data)
      console.log(error.response)
    })
}
