import { createToken } from "./algorand"
import { putToIPFS } from "./ipfs"
import { sha256 } from 'js-sha256'
import { Wallet } from "algorand-session-wallet"

/*
The following is a class and metadata type to support the ARC-0003 standard 
set forth by the Algorand Foundation and Community

https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md

*/

function metaURL(cid: string): string {
    return "ipfs://"+cid+"/metadata.json"
}
function fileURL(cid: string, name: string): string {
    return "https://cloudflare-ipfs.com/ipfs/"+cid+"/"+name
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
    static async create(file: File | undefined, wallet: Wallet, md: NFTMetadata): Promise<NFT> {
        if (file === undefined) return new NFT(new NFTMetadata())

        const result = await putToIPFS(file, md)
        console.log(result)

        const asset_id = await createToken(wallet, md, metaURL(result))
        console.log(asset_id)

        return new NFT(md, fileURL(result, md.name), asset_id)
    }
}


export type Properties = {
    [key: string]: string | number
}


export class NFTMetadata {

    name: string = ""
    description: string = ""

    image: string = ""
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
        return new File([md_blob], "metadata.json")
    }

    arc3Name(): string {
        //Max length of asset name is 32 bytes, need 5 for @arc3
        return this.name.substring(0,27) + "@arc3"
    }
}

export async function imageIntegrity(file: File): Promise<string> {
    const buff = await file.arrayBuffer()
    const bytes = new Uint8Array(buff)
    const hash = new Uint8Array(sha256.digest(bytes));
    return "sha256-"+Buffer.from(hash).toString("base64")
}