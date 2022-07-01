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



## Licence

Copyright 2021 LACChain

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.