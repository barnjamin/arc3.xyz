ARC3 Reference Implementation
-----------------------------

This repository contains an implementation of a dapp that can be used to Mint [ARC3](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md) compliant NFTs

A [live demo](https://arc3.xyz) is available.


Status:
-------

Its hosted by [Cloudflare](https://pages.dev) but I cant get it to build there so I just committed my build directory

WalletConnect on the Algorand Android app does not yet support asset creation transactions, so don't use it or you're gonna have a bad time

App is mostly there except after it mints i dont do anything yet, maybe link out to algoexplorer or an nft display page

Intention is to build Components to validate and display any Asset type that is minted (Images, GIFS, Audio, Video, PDFs, ...)

Also it looks meh and needs a logo 


Devs
-----

To hack on it start by registering for an account with [web3.storage](https://web3.storage), they provide up to 1TB of IPFS storage.

```
git clone https://github.com/barnjamin/arc3.xyz.git
cd arc3.xyz
yarn install
yarn start
```

Right now, this will open a browser window with a warning about security, you can proceed in chrome by clicking advanced and proceed.  The reason for this warning is that some cryptographic libraries require HTTPS to load and the certificate is not valid for this project yet.

I did try to create one with mkcert but browser still complained that CA was invalid.

The Wallet Session connection is provided by https://github.com/barnjamin/algorand-session-wallet  and supports AlgoSigner, MyAlgo, WalletConnect (kinda) and an Insecure Wallet (don't use with mainnet accts)

The IPFS storage is provided by https://web3.storage/ (thanks!)


