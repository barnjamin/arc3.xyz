type Config = {
    network: string;       // The network to use for creating nfts
    ipfsGateway: string;   // The IPFS gateway url for retrieving files
    algod: string          // The Algod api url to use
    blockExplorer: string; // The Block Explorer to allow linking out to
}

export const conf = require("../config.json") as Config[];

export function getAddrUrl(idx: number, addr: string): string {
    return conf[idx].blockExplorer + "address/" + addr
}
export function getAsaUrl(idx: number, id: number): string {
    return conf[idx].blockExplorer + "asset/" + id 
}

const activeConfKey = "active-conf"
export function sessionGetActiveConf(): number {
    const ac = sessionStorage.getItem(activeConfKey)
    if(ac === undefined || ac === null) return 0
    return parseInt(ac)
}

export function sessionSetActiveConf(ac: number)  {
    sessionStorage.setItem(activeConfKey, ac.toString())
}
