import * as React from 'react'
import { Elevation, Card } from "@blueprintjs/core"
import { NFT, NFTMetadata} from './lib/nft'
import { SessionWallet } from 'algorand-session-wallet'
import {useParams} from 'react-router-dom'
import { getAddrUrl, getAsaUrl } from './lib/config'
import { validateArc3 } from './lib/validator'

export type NFTViewerProps = {
    sw: SessionWallet
}

export function NFTViewer(props: NFTViewerProps) {
    const {assetId} = useParams()

    const [nft, setNFT] = React.useState(new NFT(new NFTMetadata()))
    const [loaded, setLoaded] = React.useState(false)

    React.useEffect(()=>{
        setLoaded(false)

        let subscribed = true

        NFT.fromAssetId(assetId).then((nft)=>{ 
            if(!subscribed) return

            setNFT(nft) 
            setLoaded(true)
        })

        return ()=>{ subscribed = false }
    }, [assetId])

    let img = <div></div>
    let meta = <div></div>

    if(loaded){
        img = <img alt='nft' src={nft.imgURL()}/>

        const mdProps = nft.metadata?Object.keys(nft.metadata).map((key,idx)=>{
                let prop = nft.metadata[key]
                if (prop === undefined) { prop = "" }
                if (typeof prop === 'object'){ prop = JSON.stringify(prop) }
                return (<li key={key} ><b>{key}: </b>{prop.toString()}</li>)
        }):[<li key={'none'} >No metadata</li>]

        const arc3Invalids = validateArc3(nft).map(test=>{
            return (<li key={test} > <b>{test}</b> </li>) 
        })

        meta = (
            <ul>
                <h5>Token Details</h5>

                <li><b>ASA id: </b><a href={getAsaUrl(nft.token.id)} >{nft.token.id}</a></li>
                <li><b>name: </b>{nft.token.name}</li>
                <li><b>unit name: </b>{nft.token.unitName}</li>
                <li><b>total: </b>{nft.token.total}</li>
                <li><b>url: </b> <a href={nft.token.url} >{nft.token.url}</a></li>
                <li><b>creator: </b><a href={getAddrUrl(nft.token.creator)} >{nft.token.creator}</a></li>
                <li><b>freeze: </b><a href={getAddrUrl(nft.token.creator)} >{nft.token.freeze}</a></li>
                <li><b>manager: </b><a href={getAddrUrl(nft.token.creator)} >{nft.token.manager}</a></li>
                <hr/>
                <h5>Metadata</h5>
                {mdProps}
                <hr />
                <h5>ARC3 tests failing</h5>
                {arc3Invalids}
            </ul>
        )
    }
    return (
        <div className='container'>
            <Card elevation={Elevation.THREE} >
                <div className='container'> 
                    <div className='content content-piece'>
                        {img}       
                    </div>
                    <div className='content content-info'>
                        {meta}
                    </div>
                </div>
            </Card>
        </div>
    )

}
