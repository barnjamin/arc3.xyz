type Config = {
    network: string;       // The network to use for creating nfts
    storageToken: string;  // The token provided by web3.storage
    ipfsGateway: string;   // The IPFS gateway url for retrieving files
    blockExplorer: string; // The Block Explorer to allow linking out to
}

const conf = require("../config.json") as Config;

export {conf}