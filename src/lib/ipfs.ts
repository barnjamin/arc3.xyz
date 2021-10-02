import { ipfsURL, NFTMetadata } from './nft'
import {conf} from './config'

/*
 Currently an issue with resolving ipfs-car module in web3.storage when using react-scripts
 We just use the prebuilt one but with no types we have to just ignore the issue for now
//import { Web3Storage } from 'web3.storage'
*/
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


export async function getMimeTypeFromIpfs(url: string): Promise<string> {
    const req = new Request(url, { method:"HEAD" })
    const resp = await fetch(req)
    return resp.headers.get("Content-Type")
}


export async function getMetaFromIpfs(url: string): Promise<NFTMetadata> {
    const req = new Request(url)
    const resp = await fetch(req)
    const body = await resp.blob()
    return new NFTMetadata(JSON.parse(await body.text())) 
}


