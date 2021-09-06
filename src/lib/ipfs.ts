import { ipfsURL, NFTMetadata } from './nft'
import {conf} from './config'

/*
 Currently an issue with resolving ipfs-car module in web3.storage when using react-scripts
 We just use the prebuilt one but with no types we have to just ignore the issue for now
*/

//import { Web3Storage } from 'web3.storage'
// @ts-ignore
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'

const storage = new Web3Storage({token: conf.storageToken})

export async function putToIPFS(file: File, md: NFTMetadata): Promise<string> {
    try {
      const imgAdded = await storage.put([file], {wrapWithDirectory: false})
      md.image = ipfsURL(imgAdded)

      return await storage.put([md.toFile()], {wrapWithDirectory: false})

    } catch (err) { console.error(err) }
    return ""
}

export async function getFromIPFS(url: string): Promise<NFTMetadata> {
    try {
        const req = new Request(url)
        const resp = await fetch(req)
        const body = await resp.blob()
        
        return JSON.parse(await body.text()) as NFTMetadata
    } catch (err) { console.error("Failed to get Metadata from IPFS:", err) }

    return new NFTMetadata() 
}


