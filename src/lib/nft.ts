import { createToken, getToken } from "./algorand"
import { getFromIPFS } from "./ipfs"
import { sha256 } from 'js-sha256'
import { Wallet } from "algorand-session-wallet"
import { conf } from "./config"

/*

The following is a class and metadata type to support the ARC-0003 standard 
set forth by the Algorand Foundation and Community

https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md

*/
const METADATA_FILE = "metadata.json"
const ARC3_SUFFIX = "@arc3"

export function ipfsURL(cid: string): string {
    return "ipfs://"+cid
}

export function fileURL(cid: string, name: string): string {
    return conf.ipfsGateway + cid+"/"+name
}

export function resolveURL(url: string): string {
    const chunks = url.split("://")

    // give up
    if(chunks.length < 2 ) return url

    const proto = chunks[0]

    switch(proto){
        case "ipfs":
            return conf.ipfsGateway + chunks[1]
        case "https":
            return url
    }

    return url
}

export class NFT {
    url: string
    asset_id: number // ASA index
    metadata: NFTMetadata

    constructor(md: NFTMetadata, url?:string, asset_id?: number) {
        this.metadata = md
        this.url = url?url:""
        this.asset_id = asset_id?asset_id:0 
    }

    // 
    static async create(wallet: Wallet, md: NFTMetadata, cid: string): Promise<NFT> {
        const asset_id = await createToken(wallet, md, ipfsURL(cid), md.decimals)
        return new NFT(md, fileURL(cid, md.name), asset_id)
    }

    static async fromAssetId(assetId: number): Promise<NFT>{
        const token = await getToken(assetId)
        return NFT.fromToken(token)
    }

    static async fromToken(token: any): Promise<NFT> {
        const url = token['params']['url']
        const md = await getFromIPFS(resolveURL(url))
        return new NFT(md, url, token['index'])
    }

    static isArc3(token: any): boolean {
        return token.params.name && token.params.name.endsWith(ARC3_SUFFIX)
    }

    imgURL(): string {

        const url = resolveURL(this.metadata.image)

        if(url !== this.metadata.image){
            return url
        }

        if(this.url.endsWith(METADATA_FILE)){
            const dir = this.url.substring(0,this.url.length-METADATA_FILE.length)
            return resolveURL(dir)+this.metadata.image
        }

        return ""
    }
}


export type Properties = {
    [key: string]: string | number
}


export class NFTMetadata {

    name: string = ""
    description: string = ""

    image: string = ""
    decimals?: number = 0
    image_integrity?: string = ""
    image_mimetype?: string = ""

    properties?: Properties

    constructor(args: any = {}) { Object.assign(this, args) }

    toHash(): Uint8Array {
        if(this.hasOwnProperty("extra_metadata")){
            //TODO
            //am = SHA-512/256("arc0003/am" || SHA-512/256("arc0003/amj" || content of JSON metadata file) || e)
        }

        const hash = sha256.create();
        hash.update(JSON.stringify(this));
        return new Uint8Array(hash.digest())
    }

    toFile(): File {
        const md_blob = new Blob([JSON.stringify({ ...this }, null, 2)], { type: 'application/json' })
        return new File([md_blob], METADATA_FILE)
    }

    arc3Name(): string {
        //Max length of asset name is 32 bytes, need 5 for @arc3
        return this.name.substring(0,27) + ARC3_SUFFIX
    }
}

export async function imageIntegrity(file: File): Promise<string> {
    const buff = await file.arrayBuffer()
    const bytes = new Uint8Array(buff)
    const hash = new Uint8Array(sha256.digest(bytes));
    return "sha256-"+Buffer.from(hash).toString("base64")
}