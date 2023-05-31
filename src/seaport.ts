import { ethers } from "ethers"
import seaport_1_5_abi from "./seaport_1_5_abi.json"

export const seaportInterface = new ethers.utils.Interface(seaport_1_5_abi)
export const seaportContractAddress =
  "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC"
export const seaportName = "Seaport"
export const seaportVersion = "1.5"
