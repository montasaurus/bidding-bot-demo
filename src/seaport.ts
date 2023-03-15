import { ethers } from "ethers"
import seaport_1_4_abi from "./seaport_1_4_abi.json"

export const seaportInterface = new ethers.utils.Interface(seaport_1_4_abi)
export const seaportContractAddress =
  "0x00000000000001ad428e4906aE43D8F9852d0dD6"
export const seaportName = "Seaport"
export const seaportVersion = "1.4"
