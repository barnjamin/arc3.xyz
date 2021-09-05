import { Wallet } from 'algorand-session-wallet';
import algosdk, { Transaction } from 'algosdk'
import { NFT, NFTMetadata } from './nft';

const client = new algosdk.Algodv2("", "https://testnet.algoexplorerapi.io/", "")


export async function createToken(wallet: Wallet, md: NFTMetadata, url: string): Promise<number> {
    const addr = wallet.getDefaultAccount()
    const suggested = await getSuggested(10)
    const create_txn = getAsaCreateTxn(suggested, addr, md.arc3Name(), md.toHash(), url)

    //const create_txn = getPayTxn(suggested, addr)

    const [create_txn_s] = await wallet.signTxn([create_txn])
    const result = await sendWait([create_txn_s])

    return result['asset-index']
}

export async function getSuggested(rounds: number) {
    const txParams = await client.getTransactionParams().do();
    return { ...txParams, lastRound: txParams['firstRound'] + rounds }
}

export function getPayTxn(suggestedParams: any, addr: string): Transaction {
    return  new Transaction({
        type:"pay",
        from: addr,
        to: addr,
        amount: 0,
        ...suggestedParams
    })
}

export function getAsaCreateTxn(suggestedParams: any, addr: string, name: string, mdhash: Uint8Array, url: string): Transaction {
    return  new Transaction({
        from: addr,
        assetName: name,
        assetURL: url,
        assetMetadataHash: mdhash,
        assetManager: addr,
        assetReserve: addr,
        assetClawback: addr,
        assetFreeze: addr,
        assetTotal: 1,
        assetDecimals: 0,
        type: 'acfg',
        ...suggestedParams
    })
}

export async function sendWait(signed: any[]): Promise<any> {
    try {
        const {txId}  = await client.sendRawTransaction(signed.map((t)=>{return t.blob})).do()
        const result = await waitForConfirmation(txId, 3)
        return result 
    } catch (error) { 
        console.error(error)
    }

    return undefined 
}

export async function waitForConfirmation(txId, timeout) {
    if (client == null || txId == null || timeout < 0) {
      throw new Error('Bad arguments.');
    }

    const status = await client.status().do();
    if (typeof status === 'undefined')
      throw new Error('Unable to get node status');

    const startround = status['last-round'] + 1;
    let currentround = startround;
  
    /* eslint-disable no-await-in-loop */
    while (currentround < startround + timeout) {
      const pending = await client 
        .pendingTransactionInformation(txId)
        .do();

      if (pending !== undefined) {
        if ( pending['confirmed-round'] !== null && pending['confirmed-round'] > 0) 
          return pending;
  
        if ( pending['pool-error'] != null && pending['pool-error'].length > 0) 
          throw new Error( `Transaction Rejected pool error${pending['pool-error']}`);
      }

      await client.statusAfterBlock(currentround).do();
      currentround += 1;
    }

    /* eslint-enable no-await-in-loop */
    throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
}

export async function getToken(assetId: number): Promise<any> {
  return await client.getAssetByID(assetId).do()
}

export async function getCollection(address: string): Promise<any[]> {
  const results = await client.accountInformation(address).do()

  const plist = []
  for(const a in results['assets']){
    plist.push(getToken(results['assets'][a]['asset-id']))
  }

  const assets = await Promise.all(plist)

  const collectionRequests = assets
    .filter((a)=>{ return NFT.isArc3(a) })
    .map((a)=>{ return NFT.fromToken(a) })

  return Promise.all(collectionRequests)

}