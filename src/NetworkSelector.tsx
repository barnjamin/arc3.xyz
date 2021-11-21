import { HTMLSelect } from '@blueprintjs/core'
import React from 'react'
import {conf} from './lib/config'

interface NetworkSelectorProps {
    activeConf: number
    selectNetwork(network: number)
}

export function NetworkSelector(props: NetworkSelectorProps){

    function handleSelectNetwork(e){
        props.selectNetwork(parseInt(e.target.value))
    }

    const network_list = conf.map((cfg, idx) => {
        return (<option value={idx} key={idx}> {cfg.network} </option>)
    })

    return (
        <div>
            <HTMLSelect 
                onChange={handleSelectNetwork} 
                minimal={true} 
                defaultValue={props.activeConf} >
                {network_list}
            </HTMLSelect>
        </div>
    )
}