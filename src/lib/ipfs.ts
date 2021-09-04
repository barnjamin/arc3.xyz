import { NFTMetadata } from './nft'
import {conf} from './config'

/*
 Currently an issue with resolving ipfs-car module in web3.storage when using react-scripts
 We just use the prebuilt one but with no types we have to just ignore the issue for now
*/

//import { Web3Storage } from 'web3.storage'
// @ts-ignore
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'

const storage = new Web3Storage({token: conf.storageToken})

export async function putToIPFS(file: File, md: NFTMetadata){
    try {
      const added = await storage.put([file, md.toFile()])
      return added 
    } catch (err) { console.error(err) }
    return ""
}

export async function getFromIPFS(meta_hash: string): Promise<NFTMetadata> {
    try {
        const result = await storage.get(meta_hash)
        console.log(result)
        return new NFTMetadata(result.files[0])
    } catch (err) { console.error("Failed to get Metadata from IPFS:", err) }

    return new NFTMetadata() 
}


