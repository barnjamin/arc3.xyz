import { AnchorButton, Alignment, Navbar } from '@blueprintjs/core';
import { SessionWallet } from 'algorand-session-wallet';
import React from 'react';
import {Minter} from './Minter';
import AlgorandWalletConnector from './AlgorandWalletConnector'
import {NFTViewer} from './NFTViewer'
import {Collection} from './Collection'
import { conf } from './lib/config';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'


type AppProps = {
  history: History
}


function App(props: AppProps) {

  const sw = new SessionWallet(conf.network)

  const [sessionWallet, setSessionWallet] =  React.useState(sw)
  const [accts, setAccounts] = React.useState(sw.accountList())
  const [connected, setConnected] = React.useState(sw.connected())

  function updateWallet(sw: SessionWallet){ 
    setSessionWallet(sw)
    setAccounts(sw.accountList())
    setConnected(sw.connected())
  }

  let collectionLink = <div></div>
  if(connected){
    collectionLink = <AnchorButton minimal={true} icon='folder-open' href={'/collection/'+sw.getDefaultAccount()} text='Collection' />
  }
  return (
    <Router>
      <div className="App">
        <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>ARC3.xyz</Navbar.Heading>
          <Navbar.Divider />
          <AnchorButton minimal={true} icon='git-branch' href='https://github.com/barnjamin/arc3.xyz' text='Github' />
          <AnchorButton minimal={true} icon='clean' href='/mint' text='Mint' />
          {collectionLink}
        </Navbar.Group>
        <Navbar.Group  align={Alignment.RIGHT}>



          <AlgorandWalletConnector  
            darkMode={false}
            sessionWallet={sessionWallet}
            accts={accts}
            connected={connected} 
            updateWallet={updateWallet}
          />

        </Navbar.Group>
        </Navbar>
        <Switch>
          <Route exact path="/" children={<Minter  sw={sessionWallet}></Minter>} />
          <Route exact path="/mint" children={ <Minter  sw={sessionWallet}></Minter> }/>
          <Route path="/nft/:assetId" children={ <NFTViewer  sw={sessionWallet} /> }/>
          <Route path="/collection/:address" children={ <Collection  sw={sessionWallet} /> }/>
        </Switch>
      </div>
    </Router>
  );

}

export default App;