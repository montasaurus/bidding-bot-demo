import axios, { AxiosError } from "axios"
import axiosRetry from "axios-retry"
import { OpenSeaSDK } from "opensea-js"
import * as Web3 from "web3"
import { getNetwork } from "./network"

const network = getNetwork()

const provider = new Web3.default.providers.HttpProvider(network.rpcUrl)

export const sdkClient = new OpenSeaSDK(provider, {
  networkName: network.network,
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
