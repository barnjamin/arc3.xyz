import * as React from 'react'
import { Elevation, Card } from "@blueprintjs/core"
import { NFT, NFTMetadata } from './lib/nft'
import { SessionWallet } from 'algorand-session-wallet'
import {useParams} from 'react-router-dom'
import { conf } from './lib/config'

export type NFTViewerProps = {
    history:  any 
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

        return ()=>{ subscribed= false }
    }, [assetId])

    let img = <div></div>
    let meta = <div></div>

    if(loaded){
        img = <img alt='nft' src={nft.imgURL()}/>

        const extraProps = Object.keys(nft.metadata.properties).map((key,idx)=>{
                let prop = nft.metadata.properties[key]
                if (typeof prop === 'object'){ prop = JSON.stringify(prop) }
                return (<li key={key} ><b>{key}: </b>{prop.toString()}</li>)
        })

        meta = (
            <ul>
                <li><b>name: </b>{nft.metadata.name}</li>
                <li><b>description: </b>{nft.metadata.description}</li>
                <hr/>
                {extraProps}
                <hr/>
                <li><a href={conf.blockExplorer + "asset/" + assetId} >View on Block Explorer</a></li>
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
