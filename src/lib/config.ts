type Config = {
    network: string;       // The network to use for creating nfts
    storageToken: string;  // The token provided by web3.storage
    ipfsGateway: string;   // The IPFS gateway url for retrieving files
    algod: string          // The Algod api url to use
    blockExplorer: string; // The Block Explorer to allow linking out to
}

export const conf = require("../config.json") as Config;

export function getAddrUrl(addr: string): string {
    return conf.blockExplorer + "address/" + addr
}

export function getAsaUrl(id: number): string {
    return conf.blockExplorer + "asset/" + id 
}
