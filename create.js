import inquirer from "inquirer";
import message from "bit-message-box";
import { DID } from "@lacchain/did";
import config from "./config.js";
import { set } from "./storage.js";
import { createKeyPair } from "@lacchain/did/lib/utils.js";
import DIDComm from "DIDComm-js";

import view from "./view.js";

export const generateEncryptionKeyPair = async() => {
  const didcomm = new DIDComm.DIDComm();
  await didcomm.ready;
  const keyPair = await didcomm.generateKeyPair();
  return {
    publicKey: new Buffer( keyPair.publicKey ).toString( 'hex' ),
    privateKey: new Buffer( keyPair.privateKey ).toString( 'hex' )
  }
}

async function generateEmptyDID( ui ) {
  const did = new DID({ ...config });
  const controllers = [{
    address: did.address,
    privateKey: did.config.controllerPrivateKey,
  }];
  message.info( `DID: ${did.id}
Controller Address: ${controllers[0].address}
Controller Private Key: ${controllers[0].privateKey}` );
  set( did.id,{ controllers, verificationMethods: [], created: new Date(), updated: new Date() } )

  await inquirer.prompt([{
    name: 'key',
    type: 'press-to-continue',
    anyKey: true,
    pressToContinueMessage: 'Press a key to continue...',
  }]);

  await view( ui, did.id );
}

async function generateBootstrapDID( ui ) {
  const did = new DID({ ...config });
  const encryptionKeyPair = await generateEncryptionKeyPair();
  const controllerKeyPair = createKeyPair();
  await did.addController( controllerKeyPair.address );
  const keyAgreement = {
    relationship: 'keya',
    algorithm: 'x25519ka',
    encoding: 'hex',
    publicKey: `0x${encryptionKeyPair.publicKey}`,
    controller: did.address,
  };
  await did.addKeyAgreement( keyAgreement );
  await did.changeController( controllerKeyPair.address );
  const controllers = [{
    address: did.address,
    privateKey: did.config.controllerPrivateKey,
  }, {
    address: controllerKeyPair.address,
    privateKey: controllerKeyPair.privateKey,
  }];
  message.info( `DID: ${did.id}
Controller Address: ${controllers[1].address}
Controller Private Key: ${controllers[1].privateKey}
Encryption Public Key: ${encryptionKeyPair.publicKey}
Encryption Private Key: 0x${encryptionKeyPair.privateKey}` );
  set( did.id,{ controllers, verificationMethods: [keyAgreement], created: new Date(), updated: new Date() } )

  await inquirer.prompt([{
    name: 'key',
    type: 'press-to-continue',
    anyKey: true,
    pressToContinueMessage: 'Press a key to continue...',
  }]);

  await view( ui, did.id );
}

export default async function( ui ) {
  const { option } = await inquirer.prompt( [{
    type: 'list',
    name: 'option',
    message: 'Create new DID',
    choices: [
      'Generate empty DID',
      'Generate bootstrap DID',
      new inquirer.Separator(),
      '<Go back>'
    ],
  }] );
  switch( option ){
    case 'Generate empty DID':
      await generateEmptyDID( ui );
      break;
    case 'Generate bootstrap DID':
      await generateBootstrapDID( ui );
      break;
  }
}