import * as React from 'react'
import { Elevation, Card, AnchorButton } from "@blueprintjs/core"
import { SessionWallet } from 'algorand-session-wallet'
import {useParams} from 'react-router-dom'
import { conf } from './lib/config'
import {getCollection} from './lib/algorand' 

export type CollectionProps = {
    sw: SessionWallet
}

export function Collection(props: CollectionProps) {
    const {address} = useParams()

    const [collection, setCollection] = React.useState([])
    const [loaded, setLoaded] = React.useState(false)

    React.useEffect(()=>{
        setLoaded(false)
        getCollection(address).then((collection)=>{
            setCollection(collection)
            console.log(collection)
            setLoaded(true)
        })
    }, [address])

    let nfts = [<h3 key='looking'>Checking for NFTs...</h3>]
    if(loaded ){
        if(collection.length>0){
            nfts = collection.map((nft)=>{
                const md = nft.metadata
                const icon = nft.arc3?"confirm":"circle"
                return (
                <Card className='content-collection-item' key={nft.asset_id} elevation={Elevation.TWO}>
                    <img alt='nft content' src={nft.imgURL()} />
                    <AnchorButton icon={icon} minimal={true} href={'/nft/'+nft.asset_id}><b>{md.title?md.title:md.name}</b></AnchorButton>
                </Card>
                )
            })
        }else{
            nfts = [<h3 key='none'>You dont have any ARC3 compliant NFTs on {conf.network}, <a href='/mint'>Mint one?</a></h3>]
        }
    }
    return (
    <div className='container'>
        <div className='content content-collection'>
            {nfts}
        </div>
    </div>
    )
}