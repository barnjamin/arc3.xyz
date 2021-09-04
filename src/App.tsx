import { Alignment, Navbar } from '@blueprintjs/core';
import { SessionWallet } from 'algorand-session-wallet';
import React from 'react';
import {Minter} from './Minter';
import AlgorandWalletConnector from './AlgorandWalletConnector'

function App() {


  const sw = new SessionWallet("TestNet")

  const [sessionWallet, setSessionWallet] =  React.useState(sw)
  const [accts, setAccounts] = React.useState(sw.accountList())
  const [connected, setConnected] = React.useState(sw.connected())

  function updateWallet(sw: SessionWallet){ 
    setSessionWallet(sw)
    setAccounts(sw.accountList())
    setConnected(sw.connected())
  }

  return (
    <div className="App">
      <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>ARC3.xyz</Navbar.Heading>
        <Navbar.Divider />
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
      <Minter sw={sessionWallet}></Minter>
    </div>
  );
}

export default App;