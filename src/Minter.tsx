import * as React from 'react'
import { InputGroup, Button, Elevation, FileInput, Card, Dialog, Classes, Collapse, NumericInput, FormGroup, Switch } from "@blueprintjs/core"
import {  NFT, Token, imageIntegrity } from './lib/nft'
import {Metadata} from './lib/metadata'
import { SessionWallet } from 'algorand-session-wallet'
import { putToIPFS } from './lib/ipfs'
import{ useHistory } from 'react-router-dom'

export type MinterProps = {
    sw: SessionWallet
}

export function Minter(props: MinterProps){

    const history = useHistory()

    const [meta, setMeta]               = React.useState(new Metadata())
    const [loading, setLoading]         = React.useState(false)
    const [imgSrc, setImgSrc]           = React.useState<string>();
    const [fileObj, setFileObj]         = React.useState<File>();

    const [extraProps, setExtraProps]   = React.useState([])
    const [extraPropsVisible, setExtraPropsVisible] = React.useState(false)

    const [extraParamsVisible, setExtraParamsVisible] = React.useState(false)

    // For MintDialog
    const [cid, setCID]                 = React.useState("")
    const [isMinting, setIsMinting]     = React.useState(false)

    const [token, setToken]             = React.useState(new Token({}))

    function setFile(file: File) {
        setFileObj(file)

        const reader = new FileReader();
        reader.onload = (e: any) => {  setImgSrc(e.target.result) }
        reader.readAsDataURL(file);

        setMeta((meta)=>{
            return new Metadata({
                ...meta,
                image: file.name,
                image_mimetype: file.type,
                properties:{...meta.properties, size:file.size}
            })
        })
    }


    async function mintNFT() {
        setLoading(true) 
        const md = captureMetadata()
        md.image_integrity = await imageIntegrity(fileObj)
        setMeta(md)

        const cid = await putToIPFS(fileObj, md)
        setCID(cid)

        setIsMinting(true)
    }

    function handleCancelMint(){
        setIsMinting(false)
        setLoading(false)
    }

    function handleSetNFT(nft: NFT){ return history.push("/nft/"+nft.token.id) }

    function handleChangeDecimals(v: number){ setToken((token)=>{ return new Token({...token, "decimals":v}) }) }
    function handleSetTokenParams(e) {
        const tgt = e.target
        const name = e.target.id
        const value = tgt.type === "checkbox" ? tgt.checked: tgt.value as string 
        setToken((token)=>{ return new Token({...token, [name]:value}) })
    }

    function handleChangeMeta(event: { target: any; }) {
        const target = event.target
        const name = target.name as string
        const value = target.type === 'checkbox' ? target.checked : target.value as string
        setMeta((meta)=>{ return  new Metadata({...meta, [name]:value}) })
    }

    function handleShowExtraProps(){ setExtraPropsVisible(!extraPropsVisible) }
    function handleShowExtraParams(){ setExtraParamsVisible(!extraParamsVisible) }
    function handleExtraPropRemove(idx: number) { extraProps.splice(idx, 1); setExtraProps([...extraProps]) }
    function handleAddExtraProp() { setExtraProps([...extraProps, emptyExtraProp()]) }
    function emptyExtraProp(){ return { name:"", value: "" } }
    function handleExtraPropUpdate(e){
        const idx=parseInt(e.target.dataset.id)
        if(e.target.id==="name") extraProps[idx][e.target.id]=e.target.value
        else extraProps[idx][e.target.id] = e.target.value
        setExtraProps([...extraProps])
    }


    function handleSetMyAddress(label: string){
        return (e)=>{
            setToken((token)=>{ 
                const addr = props.sw.getDefaultAccount()
                if(addr === "") alert("You need to connect you wallet before you can do this.")
                return new Token({...token, [label]: addr})
            })
        }
    }


    function captureMetadata(): Metadata {
        const eprops = extraProps.reduce((all, ep)=>{ return {...all, [ep.name]:ep.value} }, {})
        return new Metadata({
            name:           token.name,
            unitName:       token.unitName,
            decimals:       token.decimals,
            description:    meta.description,
            image_mimetype: meta.image_mimetype,
            properties:     { ...eprops, ...meta.properties}
        })
    }

    return (
        <div className='container'>
            <Card elevation={Elevation.TWO} >
                <Uploader
                    imgSrc={imgSrc}
                    setFile={setFile}
                    {...meta} />

                <div className='container' >
                    <FormGroup 
                        helperText="The Name for this asset"
                        label="Name"
                        labelFor="name"
                        labelInfo="(required)" >
                        <InputGroup
                            name='name'
                            placeholder='Name'
                            className='details-basic details-title bp3-InputGroup bp3-large'
                            onChange={handleSetTokenParams}
                            type='text'
                            id='name'
                            value={token.name} />
                    </FormGroup>
                </div>
                <div className='container'>
                    <FormGroup
                        helperText="The Unit Name for this asset "
                        label="Unit Name"
                        labelFor="unitName"
                        labelInfo="(required)" >
                        <InputGroup
                            name='unitName'
                            placeholder='Unit Name'
                            className='details-basic details-title bp3-InputGroup bp3-large'
                            onChange={handleSetTokenParams}
                            type='text'
                            id='unitName'
                            value={token.unitName} />
                    </FormGroup>
                </div>

                <div className='container'>
                    <FormGroup 
                        helperText="A description of this asset"
                        label="Description"
                        labelFor="description"
                        labelInfo="(required)" >
                        <textarea
                            rows={10}
                            cols={30}
                            placeholder='Description'
                            className='details-description bp3-InputGroup bp3-large'
                            onChange={handleChangeMeta}
                            name='description'
                            id='description'
                            value={meta.description} />
                    </FormGroup>
                </div>

                <div className='container extra-param-dropdown'>
                    <Button 
                        onClick={handleShowExtraParams}  
                        minimal={true} 
                        outlined={true} 
                        text={extraParamsVisible?"Hide extra parameters":"Show extra parameters"} 
                    />
                    <Collapse isOpen={extraParamsVisible}>
                        <div className='container extra-param-list'>

                        <FormGroup 
                            inline={true}
                            helperText="A value of >0 is considered a 'Fractional NFT'"
                            label="Decimals" labelFor="decimals" >
                            <NumericInput 
                                defaultValue={0} min={0} max={19} 
                                name='decimals'
                                id='decimals' 
                                fill={true}
                                onValueChange={handleChangeDecimals} />
                        </FormGroup>

                        <FormGroup
                            inline={true}
                            label="Default Frozen" labelFor="default-frozen" >
                            <Switch large={true} name='default-frozen' id='defaultFrozen'  onChange={handleSetTokenParams} />
                        </FormGroup>

                        <FormGroup
                            inline={true}
                            helperText="The Manager Address for this asset" 
                            label="Manager Address" labelFor="manager" >
                            <InputGroup 
                            rightElement={<Button minimal={true} text='Me' onClick={handleSetMyAddress('manager')} />}
                            value={token.manager}
                            name='manager' id='manager'   type='text' onChange={handleSetTokenParams}/>
                        </FormGroup>

                        <FormGroup
                            inline={true}
                            helperText="The Reserve Address for this asset" 
                            label="Reserve Address" labelFor="reserve" >
                            <InputGroup 
                            rightElement={<Button minimal={true} text='Me' onClick={handleSetMyAddress('reserve')} />}
                            value={token.reserve}
                            name='reserve' id='reserve'   type='text'  onChange={handleSetTokenParams} />
                        </FormGroup>

                        <FormGroup
                            inline={true}
                            helperText="The Clawback Address for this asset" 
                            label="Clawback Address" labelFor="clawback" >
                            <InputGroup 
                            rightElement={<Button minimal={true} text='Me' onClick={handleSetMyAddress('clawback')} />}
                            value={token.clawback}
                            name='clawback' id='clawback'   type='text'  onChange={handleSetTokenParams} />
                        </FormGroup>

                        <FormGroup
                            inline={true}
                            helperText="The Freeze Address for this asset" 
                            label="Freeze Address" labelFor="freeze" >
                            <InputGroup 
                            rightElement={<Button minimal={true} text='Me' onClick={handleSetMyAddress('freeze')} />} value={token.freeze}
                            name='freeze' id='freeze'  type='text'  onChange={handleSetTokenParams}/>
                        </FormGroup>
                        </div>

                    </Collapse>
                </div>

                <div className='container extra-prop-dropdown'>
                    <Button 
                        onClick={handleShowExtraProps}  
                        minimal={true} 
                        outlined={true} 
                        text={extraPropsVisible?"Hide extra props":"Show extra props"} 
                    />
                    <Collapse isOpen={extraPropsVisible}>
                        <ul className='extra-prop-list'>
                        { 
                            extraProps.map((props, idx)=>{ 
                                return (
                                <li className='extra-prop-item' key={idx} >
                                    <div className='extra-prop-container'>
                                        <InputGroup 
                                            id="name" 
                                            data-id={idx}
                                            name="name" 
                                            value={props.name}  
                                            onChange={handleExtraPropUpdate} 
                                            className='details-basic details-artist bp3-InputGroup bp3-large' />
                                        <InputGroup 
                                            id="value" 
                                            name="value" 
                                            data-id={idx}
                                            value={props.value} 
                                            onChange={handleExtraPropUpdate} 
                                            className='details-basic details-artist bp3-InputGroup bp3-large' />
                                        <Button minimal={true} icon='minus' onClick={()=>{ handleExtraPropRemove(idx) }}  />
                                    </div>
                                </li>
                                )
                            })
                        }
                        </ul>
                        <Button fill={true} icon='plus' minimal={true} onClick={handleAddExtraProp} className='extra-prop-add' />
                    </Collapse>
                </div>

                <div className='container custom-note-field'>

                </div>

                <div className='container container-mint'>
                    <Button loading={loading}
                        onClick={mintNFT}
                        rightIcon='clean'
                        large={true}
                        minimal={true}
                        outlined={true}
                        intent='success'
                        text='Mint' />
                </div>
            </Card>
            <MintDialog 
                token={token}
                isMinting={isMinting} 
                cid={cid} 
                md={meta} 
                sw={props.sw}  
                handleSetNFT={handleSetNFT}
                handleCancelMint={handleCancelMint} 
                ></MintDialog>
        </div>
    )

}

type UploaderProps = {
    imgSrc: string | undefined
    setFile(f: File): void
};

function Uploader(props: UploaderProps) {
    function captureFile(event: any) {
        event.stopPropagation()
        event.preventDefault()
        props.setFile(event.target.files.item(0))
    }

    if (props.imgSrc === undefined || props.imgSrc === "" ) return (
        <div className='container'>
            <div className='content content-piece' >
                <FileInput large={true} disabled={false} text="Choose file..." onInputChange={captureFile} />
            </div>
        </div>
    )


    return (
        <div className='container' >
            <div className='content content-piece'>
                <img id="gateway-link" alt="NFT" src={props.imgSrc} />
            </div>
        </div>
    )
}

type MintDialogProps = {
    isMinting: boolean
    cid: string
    md: Metadata
    sw: SessionWallet
    token: Token 
    handleSetNFT(NFT)
    handleCancelMint()
}

function MintDialog(props: MintDialogProps){
    const [isLoading, setIsLoading] = React.useState(false)

    function cancel(){
        setIsLoading(false)
        props.handleCancelMint()
    }

    async function mint(){
        try {
            setIsLoading(true)
            const nft = await NFT.create(props.sw.wallet, props.token, props.md, props.cid)
            setIsLoading(false)
            props.handleSetNFT(nft)
        } catch (error) {
           alert("Failed to create nft: "+error) 
           setIsLoading(false)
           props.handleCancelMint()
        }
    }

    return (
        <Dialog isOpen={props.isMinting} title="Mint it" >
            <div className={Classes.DIALOG_BODY}>
                <p>File uploaded to ipfs {props.md.image} </p>
                <p>Click "Mint" to create ASA</p>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button loading={isLoading} onClick={cancel}>Cancel</Button>
                    <Button loading={isLoading} onClick={mint}>Mint</Button>
                </div>
            </div>
        </Dialog>
    )
}