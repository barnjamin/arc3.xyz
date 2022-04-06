import { ipfsURL } from './nft'
import {Metadata} from './metadata'

/*
 Currently an issue with resolving ipfs-car module in web3.storage when using react-scripts
 We just use the prebuilt one but with no types we have to just ignore the issue for now
//import { Web3Storage } from 'web3.storage'
*/
// @ts-ignore
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'


export async function putToIPFS(activeConf: number, file: File, md: Metadata): Promise<string> {
    // Uncomment this line after you've set your storage token
    //const storage = new Web3Storage({token: conf[activeConf].storageToken})

    // We hide the token for this site behind a cloudflare worker so no sneaky petes can delete our precious files
    const storage = new Web3Storage({token: " ", endpoint:"https://worker.barnji.workers.dev"})
    const mediaAdded = await storage.put([file], {wrapWithDirectory: false})
    ipfsURL(mediaAdded)
    switch(md.mediaType(false)){
        case 'image':
            md.image = ipfsURL(mediaAdded)
            break
        case 'audio':
            md.animation_url = ipfsURL(mediaAdded)
            break
        case 'video':
            md.animation_url = ipfsURL(mediaAdded)
            break
    }

    return await storage.put([md.toFile()], {wrapWithDirectory: false})
}


export async function getMimeTypeFromIpfs(url: string): Promise<string> {
    const req = new Request(url, { method:"HEAD" })
    const resp = await fetch(req)
    return resp.headers.get("Content-Type")
}


export async function getMetaFromIpfs(url: string): Promise<Metadata> {
    const req = new Request(url)
    const resp = await fetch(req)
    const body = await resp.blob()
    const text = await body.text()
    const parsed = JSON.parse(text)
    return new Metadata({"_raw":text, ...parsed}) 
}


