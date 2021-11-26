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
    activeConf: number
    sw: SessionWallet
}

export function NFTViewer(props: NFTViewerProps) {
    const {assetId} = useParams()

    const [nft, setNFT] = React.useState(new NFT(new Metadata()))
    const [loaded, setLoaded] = React.useState(false)

    React.useEffect(()=>{
        setLoaded(false)

        let subscribed = true

        NFT.fromAssetId(props.activeConf, assetId).then((nft)=>{ 
            if(!subscribed) return

            setNFT(nft) 
            setLoaded(true)
        })

        return ()=>{ subscribed = false }
    }, [assetId, props.activeConf])

    let img = <div></div>
    let meta = <div></div>

    if(loaded){
        img = <img alt='nft' className='bp3-elevation-3' src={nft.imgURL(props.activeConf)}/>

        const mdProps = nft.metadata && nft.metadata["_raw"] !== undefined?(
            <div className='raw-metadata'>
                <SyntaxHighlighter language='json' style={docco} wrapLongLines={true}  >
                    {nft.metadata.toString(true)}
                </SyntaxHighlighter>
            </div>
        ):<p>No metadata</p>

        const arc3Invalids = validateArc3(nft).map(test=>{
            if(test.pass)
                return (<li key={test.name} >  <Icon icon='tick' intent='success' /> <b>{test.name}</b></li>) 

            return (<li key={test.name} > <Icon icon='cross' intent='danger' /> <b>{test.name}</b> </li>) 
        })

        meta = (
        <div>
            <h5>Token Parameters</h5>
            <div className='content'>
                <table>
                    <tbody>
                        <tr><td><b>ASA id: </b></td><td><a rel="noreferrer" target="_blank" href={getAsaUrl(props.activeConf, nft.token.id)} >{nft.token.id}</a></td></tr>
                        <tr><td><b>Name:</b></td><td>{nft.token.name}</td></tr>
                        <tr><td><b>Unit Name:</b></td><td>{nft.token.unitName}</td></tr>
                        <tr><td><b>Total:</b></td><td>{nft.token.total}</td></tr>
                        <tr><td><b>Decimals:</b></td><td>{nft.token.decimals}</td></tr>
                        <tr><td><b>URL:     </b></td><td><a rel="noreferrer" target="_blank" href={resolveProtocol(props.activeConf, nft.token.url)} >{nft.token.url}</a></td></tr>
                        <tr><td><b>Creator: </b></td><td><a rel="noreferrer" target="_blank" href={getAddrUrl(props.activeConf, nft.token.creator)}  >{nft.token.creator}</a></td></tr>
                        <tr><td><b>Manager: </b></td><td><a rel="noreferrer" target="_blank" href={getAddrUrl(props.activeConf, nft.token.manager)}  >{nft.token.manager}</a></td></tr>
                        <tr><td><b>Reserve: </b></td><td><a rel="noreferrer" target="_blank" href={getAddrUrl(props.activeConf, nft.token.reserve)}  >{nft.token.reserve}</a></td></tr>
                        <tr><td><b>Freeze:  </b></td><td><a rel="noreferrer" target="_blank" href={getAddrUrl(props.activeConf, nft.token.freeze) }  >{nft.token.freeze }</a></td></tr>
                        <tr><td><b>Clawback:</b></td><td><a rel="noreferrer" target="_blank" href={getAddrUrl(props.activeConf, nft.token.clawback)} >{nft.token.clawback}</a></td></tr>
                        <tr><td><b>Metadata Hash: </b></td><td>{nft.token.metadataHash}</td></tr>
                        <tr><td><b>Default Frozen: </b></td><td>{nft.token.defaultFrozen?"Yes":"No"}</td></tr>
                    </tbody>
                </table>
            </div>
            <hr/>
            <h5>Metadata</h5>
            <div className='content'>
                {mdProps}
            </div>
            <hr/> 
            <h5>ARC3 tests:</h5>
            <div className='content'>
                <ul>
                    {arc3Invalids}
                </ul>
            </div>
        </div>
        )
    }

    return (
        <div className='container'>
            <Card elevation={Elevation.THREE} >
                <div className='container'> 
                    <div className='content content-piece'>
                        {img}       
                    </div>
                    <div className='content-info'>
                        {meta}
                    </div>
                </div>
            </Card>
        </div>
    )
}