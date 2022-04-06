import * as React from 'react'
import { Elevation, Card, AnchorButton } from "@blueprintjs/core"
import { SessionWallet } from 'algorand-session-wallet'
import {useParams} from 'react-router-dom'
import { conf } from './lib/config'
import {getCollection} from './lib/algorand' 
import { validArc3 } from './lib/validator'
import {NFT} from './lib/nft'
import { MediaDisplay } from './MediaDisplay'

export type CollectionProps = {
    activeConf: number
    sw: SessionWallet
}

export function Collection(props: CollectionProps) {
    const {address} = useParams()

    const [collection, setCollection] = React.useState([])
    const [loaded, setLoaded] = React.useState(false)

    React.useEffect(()=>{
        setLoaded(false)
        console.log(address)
        getCollection(props.activeConf, address).then((collection)=>{
            setCollection(collection)
            setLoaded(true)
        })

    }, [address, props.activeConf])

    let nfts = [<h3 key='looking'>Checking for NFTs...</h3>]

    if(loaded ){
        if(collection.length>0){
            nfts = collection.filter((nft: NFT)=>{
                return nft.id() !== 0
            }).map((nft: NFT)=>{
                const icon = validArc3(nft)?"confirm":"circle"
                return (
                <Card className='content-collection-item' key={nft.id()} elevation={Elevation.TWO}>
                    <MediaDisplay mediaSrc={nft.mediaURL(props.activeConf, true)} mimeType={nft.metadata.mimeType(true)} />
                    <AnchorButton icon={icon} minimal={true} href={'/nft/'+nft.id()}><b>{nft.name()}</b></AnchorButton>
                </Card>
                )
            })
        }else{
            nfts = [<h3 key='none'>You dont have any ARC3 compliant NFTs on {conf[props.activeConf].network}, <a href='/mint'>Mint one?</a></h3>]
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