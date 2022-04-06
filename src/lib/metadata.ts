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

// Just takes the first chunk of the mimetype (the type)
export function getTypeFromMimeType(filetype: string): string {
    const [type, _] = filetype.split("/")
    return type
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

    reserve?: string = ""

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

    toHash(fmt: Boolean = false): Uint8Array {
        if(this.hasOwnProperty("extra_metadata")){
            //TODO
            //am = SHA-512/256("arc0003/am" || SHA-512/256("arc0003/amj" || content of JSON metadata file) || e)
        }

        if(this._raw === undefined)
            this._raw = this.toString(false)

        const hash = sha256.create();
        fmt ? hash.update(this.toString(false)):hash.update(this._raw);
        return new Uint8Array(hash.digest())
    }

    valid(): boolean {
        return this.image !== "" || this.animation_url !== "" || this.external_url !== ""
    }

    toFile(): File {
        const md_blob = new Blob([this.toString()], { type: JSON_TYPE })
        return new File([md_blob], METADATA_FILE)
    }

    toString(fmt: Boolean = false): string {
        if(this._raw === undefined) this._raw = JSON.stringify({...this}, omitRawAndEmpty)
        return JSON.stringify(JSON.parse(this._raw) , omitRawAndEmpty, fmt?2:0)
    }

    mimeType(small: boolean): string {
        if(small) return this.image_mimetype

        if(this.animation_url !== "") return this.animation_url_mimetype;
        if(this.external_url_mimetype !== "") return this.external_url_mimetype;

        return this.image_mimetype
    }

    mediaType(small: boolean): string {
        return getTypeFromMimeType(this.mimeType(small))
    }

    mediaURL(small: boolean): string {
        if(this.animation_url !== "" && !small) {
            return this.animation_url
        }
        return this.image
    }

    static fromToken(t: Token){
        return new Metadata({name:t.name, image: t.url, decimals: t.decimals, reserve: t.reserve })
    }

}
