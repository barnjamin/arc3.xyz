import { createToken, getToken } from "./algorand"
import { getMimeTypeFromIpfs, getMetaFromIpfs } from "./ipfs"
import { sha256 } from 'js-sha256'
import { Wallet } from "algorand-session-wallet"
import { conf } from "./config"
import {Metadata} from './metadata'

/*

The following is a class and metadata type to support the ARC-0003 standard 
set forth by the Algorand Foundation and Community

https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md

*/

export const ARC3_NAME_SUFFIX = "@arc3"
export const ARC3_URL_SUFFIX = "#arc3"
export const METADATA_FILE = "metadata.json"
export const JSON_TYPE = 'application/json'

export function asaURL(cid: string): string { return ipfsURL(cid)+ARC3_URL_SUFFIX }
export function ipfsURL(cid: string): string { return "ipfs://"+cid }
export function fileURL(cid: string, name: string): string { return conf.ipfsGateway + cid+"/"+name }

export function resolveProtocol(url: string): string {

    if(url.endsWith(ARC3_URL_SUFFIX)) 
        url = url.slice(0, url.length-ARC3_URL_SUFFIX.length)

    const chunks = url.split("://")

    // No protocol specified, give up
    if(chunks.length < 2 ) return url

    //Switch on the protocol
    switch(chunks[0]){
        case "ipfs": //Its ipfs, use the configured gateway
            return conf.ipfsGateway + chunks[1]
        case "https": //Its already http, just return it
            return url
        // TODO: Future options may include arweave or algorand
    }

    return url
}

export async function imageIntegrity(file: File): Promise<string> {
    const buff = await file.arrayBuffer()
    const bytes = new Uint8Array(buff)
    const hash = new Uint8Array(sha256.digest(bytes));
    return "sha256-"+Buffer.from(hash).toString("base64")
}

export class Token {
    id:  number 

    name: string        
    unitName: string    
    url: string         

    metadataHash: string

    total: number       
    decimals: number    

    creator: string

    manager: string
    reserve: string
    clawback: string
    freeze: string

    defaultFrozen: boolean
    
    constructor(t: any) {
       this.name            = t.name || ""
       this.unitName        = t.unitName || ""
       this.url             = t.url || ""

       this.metadataHash    = t.metadataHash || ""

       this.total           = t.total || 0
       this.decimals        = t.decimals || 0

       this.creator         = t.creator || ""

       this.manager         = t.manager || ""
       this.reserve         = t.reserve || ""
       this.clawback        = t.clawback || ""
       this.freeze          = t.freeze || ""

       this.defaultFrozen   = t.defaultFrozen || false
    }

    static fromParams(p: any ): Token {
        return {
            name            : p.name || "",
            unitName        : p['unit-name'] || "",
            url             : p.url || "",
            metadataHash    : p['metadata-hash'] || "",
            total           : p.total || 0,
            decimals        : p.decimals || 0,
            creator         : p.creator || "",
            manager         : p.manager || "",
            reserve         : p.reserve || "",
            clawback        : p.clawback || "",
            freeze          : p.freeze || "",
            defaultFrozen   : p['default-frozen'] || false,
        } as Token

    }

}

export class NFT {
    token: Token
    metadata: Metadata

    urlMimeType: string

    constructor(md: Metadata, token?: Token, urlMimeType?: string) {
        this.metadata = md
        this.token = token
        this.urlMimeType = urlMimeType
    }

    static async create(wallet: Wallet, token: Token, md: Metadata, cid: string): Promise<NFT> {
        const asset_id = await createToken(wallet, token, md, asaURL(cid), md.decimals)
        return await NFT.fromAssetId(asset_id)
    }

    static async fromAssetId(assetId: number): Promise<NFT>{
        return NFT.fromToken(await getToken(assetId))
    }

    static async fromToken(t: any): Promise<NFT> {
        const token = new Token(t)

        const url = resolveProtocol(token.url)

        //TODO: provide getters for other storage options
        // arweave? note field?

        const urlMimeType = await getMimeTypeFromIpfs(url)

        switch(urlMimeType){
            case JSON_TYPE:
                return new NFT(await getMetaFromIpfs(url), token, urlMimeType)
        }

        return new NFT(Metadata.fromToken(token), token, urlMimeType)
    }


    imgURL(): string {
        // Try to resolve the protocol, if one is set 
        const url = resolveProtocol(this.metadata.image)

        // If the url is different, we resolved it correctly
        if(url !== this.metadata.image) return url

        // It may be a relative url stored within the same directory as the metadata file
        // Lop off the METADATA_FILE bit and append image path 
        if(this.token.url.endsWith(METADATA_FILE)){
            const dir = this.token.url.substring(0,this.token.url.length-METADATA_FILE.length)
            return resolveProtocol(dir)+this.metadata.image
        }

        // give up
        return url 
    }
}