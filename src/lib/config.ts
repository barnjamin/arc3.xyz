type Config = {
    storageToken: string; // The token provided by web3.storage
    ipfsGateway: string;  // The IPFS gateway url for retrieving files
}

const conf = require("../../config.json") as Config;

export {conf}