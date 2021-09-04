ARC3 Reference Implementation
-----------------------------


This repository contains an implementation of a dapp that can be used to Mint [ARC3](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md) compliant NFTs

To hack on it start by registering for an account with web3.storage, they provide up to 1TB of IPFS storage.

```
git clone https://github.com/barnjamin/arc3.xyz.git
cd arc3.xyz
yarn install
yarn start
```

Right now, this will open a browser window with a warning about security, you can proceed in chrome by clicking advanced and proceed.  The reason for this warning is that some cryptographic libraries require HTTPS to load and the certificate is not valid for this project yet.

The Wallet Session connection is provided by https://github.com/barnjamin/algorand-session-wallet  and supports AlgoSigner, MyAlgo, WalletConnect and an Insecure Wallet

The IPFS storage is provided by https://web3.storage/
