import {NFT, JSON_TYPE} from './nft'

function mdurl(nft: NFT): boolean {
    return nft.urlMimeType === JSON_TYPE 
}

function mdhash(nft: NFT): boolean {
    return nft.token.metadataHash === Buffer.from(nft.metadata.toHash()).toString("base64")
}

function total(nft: NFT): boolean {
    return (nft.token.total / Math.pow(10, nft.token.decimals)) === 1
}

// TODO: Check that metadata contains correct fields
// TODO: Check that integrity hashes are valid

const validators = {
    "URL Points to metadata": mdurl,
    "Metadata Hash matches":mdhash,
    "Total Supply Is 1": total,
}


export function validArc3(nft: NFT): boolean {
    return validateArc3(nft).length === 0
}

interface Arc3Test {
    name: string
    pass: boolean
}

export function validateArc3(nft: NFT): Arc3Test[] {
    const tests = []
    for(const k in validators){
        tests.push({name:k,pass:validators[k](nft)})
    }
    return tests 
}