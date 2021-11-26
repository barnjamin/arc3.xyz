import {Token, JSON_TYPE, METADATA_FILE} from './nft'
import { sha256 } from 'js-sha256'

export type Properties = {
    [key: string]: string | number
}

export type LocalizationIntegrity = {
    [key: string]: string 
}

export type Localization = {
    uri: string 
    default: string 
    locales: string[] 
    integrity?: LocalizationIntegrity
}


function omitRawAndEmpty(k,v){
    if(k === "_raw") return undefined;
    if(v === "") return undefined;
    return v
}

export class Metadata {
    _raw: string = undefined

    name: string = ""
    description: string = ""

    image: string = ""
    decimals?: number = 0
    unitName?: string = ""
    image_integrity?: string = ""
    image_mimetype?: string = ""

    background_color?: string = ""
    external_url?: string = ""
    external_url_integrity?: string = ""
    external_url_mimetype?: string = ""

    animation_url?: string = ""
    animation_url_integrity?: string = ""
    animation_url_mimetype?: string = ""

    extra_metadata?: string = ""

    localization?: Localization

    properties?: Properties

    constructor(args: any = {}) { Object.assign(this, args) }

    toHash(marshalled: Boolean = false): Uint8Array {
        if(this.hasOwnProperty("extra_metadata")){
            //TODO
            //am = SHA-512/256("arc0003/am" || SHA-512/256("arc0003/amj" || content of JSON metadata file) || e)
        }

        if(this._raw === undefined) 
            this._raw = this.toString()

        const hash = sha256.create();
        hash.update(this.toString(marshalled));
        return new Uint8Array(hash.digest())
    }

    valid(): boolean {
        return this.image !== ""
    }

    toFile(): File {
        const md_blob = new Blob([this.toString()], { type: JSON_TYPE })
        return new File([md_blob], METADATA_FILE)
    }

    toString(fmt: Boolean = false): string {
        return JSON.stringify({...this}, omitRawAndEmpty, fmt?2:0)
    }

    static fromToken(t: Token){
        return new Metadata({ name:t.name, image: t.url, decimals: t.decimals })
    }
}
