import axios, { AxiosError } from "axios"
import axiosRetry from "axios-retry"
import { ethers } from "ethers"
import { OpenSeaSDK } from "opensea-js"
import { getNetwork } from "./network"

const network = getNetwork()

const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)

export const sdkClient = new OpenSeaSDK(provider, {
  chain: network.network,
  apiKey: network.apiKey,
})

const headers = network.apiKey ? { "X-API-KEY": network.apiKey } : {}

const client = axios.create({
  baseURL: network.baseURL,
  headers,
})

axiosRetry(client, {
  retryCondition: (error: AxiosError) => {
    return error.response?.status === 429
  },
  retryDelay: (retryCount: number, error: AxiosError) => {
    if (error.response && error.response.headers["retry-after"]) {
      return parseInt(error.response.headers["retry-after"]) * 1000
    }
    return retryCount * 1000
  },
})

export const apiClient = client
