import { Alignment, Navbar } from '@blueprintjs/core';
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
  Link,
  useHistory
} from 'react-router-dom'


function App() {


  const history = useHistory()

  const sw = new SessionWallet(conf.network)

  const [sessionWallet, setSessionWallet] =  React.useState(sw)
  const [accts, setAccounts] = React.useState(sw.accountList())
  const [connected, setConnected] = React.useState(sw.connected())

  function updateWallet(sw: SessionWallet){ 
    setSessionWallet(sw)
    setAccounts(sw.accountList())
    setConnected(sw.connected())
  }

  return (
    <Router>
      <div className="App">
        <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>ARC3.xyz</Navbar.Heading>
          <Navbar.Divider />
          <Link to='/mint' >Mint</Link>
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
          <Route exact path="/" children={<Minter history={history} sw={sessionWallet}></Minter>} />
          <Route exact path="/mint" children={ <Minter history={history} sw={sessionWallet}></Minter> }/>
          <Route path="/nft/:assetId" children={ <NFTViewer history={history} sw={sessionWallet} /> }/>
          <Route path="/collection/:address" children={ <Collection history={history} sw={sessionWallet} /> }/>
        </Switch>
      </div>
    </Router>
  );

}

export default App;