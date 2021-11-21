import * as React from 'react'
import { Elevation, Card, Icon } from "@blueprintjs/core"
import { NFT, resolveProtocol  } from './lib/nft'
import { Metadata } from './lib/metadata'
import { SessionWallet } from 'algorand-session-wallet'
import {useParams} from 'react-router-dom'
import { getAddrUrl, getAsaUrl } from './lib/config'
import { validateArc3 } from './lib/validator'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from  'react-syntax-highlighter/dist/esm/styles/hljs'

export type NFTViewerProps = {
    sw: SessionWallet
}

export function NFTViewer(props: NFTViewerProps) {
    const {assetId} = useParams()

    const [nft, setNFT] = React.useState(new NFT(new Metadata()))
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
        img = <img alt='nft' className='bp3-elevation-3' src={nft.imgURL()}/>

        const mdProps = nft.metadata && nft.metadata["_raw"] !== undefined?(
            <li key="_raw" >
                <SyntaxHighlighter language='json' style={docco} wrapLongLines={true}>
                    {nft.metadata["_raw"]}
                </SyntaxHighlighter>
            </li>
        ):[<li key={'none'} >No metadata</li>]

        const arc3Invalids = validateArc3(nft).map(test=>{
            if(test.pass)
                return (<li key={test.name} >  <Icon icon='tick' intent='success' /> <b>{test.name}</b></li>) 

            return (<li key={test.name} > <Icon icon='cross' intent='danger' /> <b>{test.name}</b> </li>) 
        })

        meta = (
            <ul>
                <h5>Token Details</h5>

                <li><b>ASA id: </b><a rel="noreferrer" target="_blank" href={getAsaUrl(nft.token.id)} >{nft.token.id}</a></li>
                <li><b>Name:    </b>{nft.token.name}</li>
                <li><b>Unit Name: </b>{nft.token.unitName}</li>
                <li><b>Total:   </b>{nft.token.total}</li>
                <li><b>URL:     </b><a rel="noreferrer" target="_blank" href={resolveProtocol(nft.token.url)} >{nft.token.url}</a></li>
                <li><b>Creator: </b><a rel="noreferrer" target="_blank" href={getAddrUrl(nft.token.creator)}  >{nft.token.creator}</a></li>
                <li><b>Manager: </b><a rel="noreferrer" target="_blank" href={getAddrUrl(nft.token.manager)}  >{nft.token.manager}</a></li>
                <li><b>Reserve: </b><a rel="noreferrer" target="_blank" href={getAddrUrl(nft.token.reserve)}  >{nft.token.reserve}</a></li>
                <li><b>Freeze:  </b><a rel="noreferrer" target="_blank" href={getAddrUrl(nft.token.freeze) }  >{nft.token.freeze }</a></li>
                <li><b>Clawback:</b><a rel="noreferrer" target="_blank" href={getAddrUrl(nft.token.clawback)} >{nft.token.clawback}</a></li>
                <li><b>Metadata Hash: </b>{nft.token.metadataHash}</li>

                <hr/>
                <h5>Metadata</h5>
                {mdProps}
                <hr />
                <h5>ARC3 tests:</h5>
                <ul>
                    {arc3Invalids}
                </ul>
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