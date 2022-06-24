import inquirer from "inquirer";
import { DID } from "@lacchain/did";
import config from "./config.js";
import { set } from "./storage.js";
import { createKeyPair } from "@lacchain/did/lib/utils.js";
import DIDComm from "DIDComm-js";

export const generateEncryptionKeyPair = async() => {
  const didcomm = new DIDComm.DIDComm();
  await didcomm.ready;
  const keyPair = await didcomm.generateKeyPair();
  return {
    publicKey: new Buffer( keyPair.publicKey ).toString( 'hex' ),
    privateKey: new Buffer( keyPair.privateKey ).toString( 'hex' )
  }
}

async function generateEmptyDID() {
  const did = new DID({ ...config });
  const controllers = [{
    address: did.address,
    privateKey: did.config.controllerPrivateKey,
  }];
  console.log( `DID: ${did.id}` );
  console.log( `Controller Address: ${controllers[0].address}` );
  console.log( `Controller Private Key: ${controllers[0].privateKey}` );
  set( did.id,{ controllers, created: new Date(), updated: new Date() } )
}

async function generateBootstrapDID(ui) {
  const did = new DID({ ...config });
  const encryptionKeyPair = await generateEncryptionKeyPair();
  const controllerKeyPair = createKeyPair();
  await did.addController( controllerKeyPair.address );
  await did.addKeyAgreement( {
    algorithm: 'x25519ka',
    encoding: 'hex',
    publicKey: `0x${encryptionKeyPair.publicKey}`,
    controller: did.address,
  } );
  await did.changeController( controllerKeyPair.address );
  const controllers = [{
    address: did.address,
    privateKey: did.config.controllerPrivateKey,
  }, {
    address: controllerKeyPair.address,
    privateKey: controllerKeyPair.privateKey,
  }];
  console.log( `DID: ${did.id}` );
  console.log( `Controller Address: ${controllers[1].address}` );
  console.log( `Controller Private Key: ${controllers[1].privateKey}` );
  console.log( `Encryption Public Key: ${encryptionKeyPair.publicKey}` );
  console.log( `Encryption Private Key: 0x${encryptionKeyPair.privateKey}` );
  set( did.id,{ controllers, created: new Date(), updated: new Date() } )
}

export default async function(ui) {
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
      await generateEmptyDID();
      break;
    case 'Generate bootstrap DID':
      await generateBootstrapDID();
      break;
  }
}