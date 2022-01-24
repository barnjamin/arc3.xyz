import { createToken, getToken } from './algorand'
import { getMetaFromIpfs, getMimeTypeFromIpfs } from './ipfs'
import { sha256 } from 'js-sha256'
import { Wallet } from 'algorand-session-wallet'
import { conf } from './config'
import { Metadata } from './metadata'
import { decodeAddress } from 'algosdk'
import { CID } from 'multiformats/cid'
import * as mfsha2 from 'multiformats/hashes/sha2'
import * as digest from 'multiformats/hashes/digest'
import { CIDVersion } from 'multiformats/types/cid'

/*

The following is a class and metadata type to support the ARC-0003 standard
set forth by the Algorand Foundation and Community

https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md

*/

export const ARC3_NAME_SUFFIX = '@arc3'
export const ARC3_URL_SUFFIX = '#arc3'
export const METADATA_FILE = 'metadata.json'
export const JSON_TYPE = 'application/json'

export function asaURL (cid: string): string { return ipfsURL(cid) + ARC3_URL_SUFFIX }

export function ipfsURL (cid: string): string { return 'ipfs://' + cid }

export function fileURL (activeConf: number, cid: string, name: string): string { return conf[activeConf].ipfsGateway + cid + '/' + name }

export function resolveProtocol (activeConf: number, url: string, reserveAddr: string): string {

    if (url.endsWith(ARC3_URL_SUFFIX))
        url = url.slice(0, url.length - ARC3_URL_SUFFIX.length)

    let chunks = url.split('://')
    console.log('resolve protocol:', url)
    console.log(chunks)
    // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be
    if (chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
        // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
        chunks[0] = 'ipfs'
        const cidComponents = chunks[1].split(':')
        if (cidComponents.length !== 5) {
            // give up
            console.log('unknown ipfscid format')
            return url
        }
        const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents

        const cidVersionInt = parseInt(cidVersion) as CIDVersion
        if (cidHash.split('}')[0] !== 'sha2-256') {
            console.log('unsupported hash:', cidHash)
            return url
        }
        if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
            console.log('unsupported codec:', cidCodec)
            return url
        }
        if (asaField !== 'reserve') {
            console.log('unsupported asa field:', asaField)
            return url
        }
        let cidCodecCode
        if (cidCodec === 'raw') {
            cidCodecCode = 0x55
        } else if (cidCodec === 'dag-pb') {
            cidCodecCode = 0x70
        }

        // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
        const addr = decodeAddress(reserveAddr)
        const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey)

        const cid = CID.create(cidVersionInt, cidCodecCode, mhdigest)
        console.log('switching to id:', cid.toString())
        chunks[1] = cid.toString() + '/' + chunks[1].split('/').slice(1).join('/')
        console.log('redirecting to ipfs:', chunks[1])
    }

    // No protocol specified, give up
    if (chunks.length < 2) return url

    //Switch on the protocol
    switch (chunks[0]) {
        case 'ipfs': //Its ipfs, use the configured gateway
            return conf[activeConf].ipfsGateway + chunks[1]
        case 'https': //Its already http, just return it
            return url
        // TODO: Future options may include arweave or algorand
    }

    return url
}

export async function imageIntegrity (file: File): Promise<string> {
    const buff = await file.arrayBuffer()
    const bytes = new Uint8Array(buff)
    const hash = new Uint8Array(sha256.digest(bytes))
    return 'sha256-' + Buffer.from(hash).toString('base64')
}

export class Token {
    id: number

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

    constructor (t: any) {
        this.id = t.id || 0
        this.name = t.name || ''
        this.unitName = t.unitName || ''
        this.url = t.url || ''

        this.metadataHash = t.metadataHash || ''

        this.total = t.total || 0
        this.decimals = t.decimals || 0

        this.creator = t.creator || ''

        this.manager = t.manager || ''
        this.reserve = t.reserve || ''
        this.clawback = t.clawback || ''
        this.freeze = t.freeze || ''

        this.defaultFrozen = t.defaultFrozen || false
    }

    static fromParams (t: any): Token {
        const p = t.params
        return new Token({
            id: t.index,
            name: p.name || '',
            unitName: p['unit-name'] || '',
            url: p.url || '',
            metadataHash: p['metadata-hash'] || '',
            total: p.total || 0,
            decimals: p.decimals || 0,
            creator: p.creator || '',
            manager: p.manager || '',
            reserve: p.reserve || '',
            clawback: p.clawback || '',
            freeze: p.freeze || '',
            defaultFrozen: p['default-frozen'] || false,
        }) as Token

    }

    valid (): boolean {
        return this.id > 0 && this.total > 0 && this.url !== ''
    }

}

export class NFT {
    token: Token = new Token({})
    metadata: Metadata = new Metadata()

    urlMimeType: string

    constructor (md: Metadata, token?: Token, urlMimeType?: string) {
        this.metadata = md
        this.token = token
        this.urlMimeType = urlMimeType
    }

    static async create (wallet: Wallet, activeConf: number, token: Token, md: Metadata, cid: string): Promise<NFT> {
        token.url = asaURL(cid)
        const asset_id = await createToken(wallet, activeConf, token, md)
        return await NFT.fromAssetId(activeConf, asset_id)
    }

    static async fromAssetId (activeConf: number, assetId: number): Promise<NFT> {
        return NFT.fromToken(activeConf, await getToken(activeConf, assetId))
    }

    static async fromToken (activeConf: number, t: any): Promise<NFT> {
        const token = Token.fromParams(t)
        const url = resolveProtocol(activeConf, token.url, token.reserve)

        //TODO: provide getters for other storage options
        // arweave? note field?

        try {
            const urlMimeType = await getMimeTypeFromIpfs(url)

            switch (urlMimeType) {
                case JSON_TYPE:
                    return new NFT(await getMetaFromIpfs(url), token, urlMimeType)
            }

            return new NFT(Metadata.fromToken(token), token, urlMimeType)
        } catch (error) {
            return new NFT(new Metadata(), token)
        }
    }

    valid (): boolean {
        return this.token.valid() && this.metadata.valid()
    }

    name (): string {
        if (this.metadata.valid()) {
            return this.metadata.name
        }
        if (this.token.valid()) {
            return this.token.name
        }
        return ''
    }

    id (): number {
        return this.token.valid() ? this.token.id : 0
    }

    imgURL (activeConf: number): string {
        if (!this.valid()) return 'https://dummyimage.com/640x360/fff/aaa'

        // Try to resolve the protocol, if one is set
        const url = resolveProtocol(activeConf, this.metadata.image, this.metadata.reserve)

        // If the url is different, we resolved it correctly
        if (url !== this.metadata.image) return url

        // It may be a relative url stored within the same directory as the metadata file
        // Lop off the METADATA_FILE bit and append image path
        if (this.token.url.endsWith(METADATA_FILE)) {
            const dir = this.token.url.substring(0, this.token.url.length - METADATA_FILE.length)
            return resolveProtocol(activeConf, dir, this.metadata.reserve) + this.metadata.image
        }

        // give up
        return url
    }
}
