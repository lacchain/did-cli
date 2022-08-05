This repository includes the LACChain DID CLI.

The LACChain DID command line allows you to manage the "lac" DIDs. The operations that can be performed from this tool:

- Create a new empty DID
- Create a new DID to use in the mailbox
- List the DIDs
- Register Verification Methods
- Revoke Verification Methods
- Add Controllers
- Revoke Drivers
- Register Services
- Revoke Services
- Resolve a DID Document

## Install

First, install [Node.js](http://nodejs.org/) and [npm](https://npmjs.com/).
Then, install the LACChain DID CLI running:

```sh
git clone https://github.com/lacchain/did-cli
cd did-cli
nvm install
yarn install
```

## Usage

Just execute the following command and you will get a interactive console to choose options:

```sh
npm start
```

## Using Docker
