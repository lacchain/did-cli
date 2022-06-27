import inquirer from "inquirer"
import { get, set } from "./storage.js";
import view from "./view.js";
import {
  encodings,
  getRawVerificationMethod,
  getVMId,
  keyAlgorithms,
  relationships, types
} from "./util.js";
import { generateEncryptionKeyPair } from "./create.js";
import { createKeyPair } from "@lacchain/did/lib/utils.js";
import { generateKeyPairSync } from "crypto";
import bbs from "@mattrglobal/jsonld-signatures-bbs";
import message from "bit-message-box";

export async function listVM( ui, did ) {
  const document = await did.getDocument();
  const storedDID = await get( did.id );

  if( document.verificationMethod.length <= 0 ){
    message.warn( "There is no Verification Methods registered yet" );
    await inquirer.prompt([{
      name: 'key',
      type: 'press-to-continue',
      anyKey: true,
      pressToContinueMessage: 'Press a key to continue...',
    }]);
    return await view( ui, did.id );
  }

  const { verificationMethod } = await inquirer.prompt( [{
    type: 'list',
    name: 'verificationMethod',
    message: `${did.id}@verificationMethods`,
    choices: [
      ...document.assertionMethod.map( vm => `${vm.id} (assertionMethod)` ),
      ...document.authentication.map( vm => `${vm.id} (authentication)` ),
      ...document.keyAgreement.map( vm => `${vm.id} (keyAgreement)` ),
      ...document.capabilityInvocation.map( vm => `${vm.id} (capabilityInvocation)` ),
      ...document.capabilityDelegation.map( vm => `${vm.id} (capabilityDelegation)` ),
      new inquirer.Separator(),
      'Go Back',
    ],
    pageSize: 10
  }] );

  if( verificationMethod === 'Go Back' ) return await view( ui, did.id );

  const selectedVM = document.verificationMethod.find( vm => verificationMethod.startsWith( vm.id ) );
  const relationship = verificationMethod.split( ' ' )[1].replace( '(', '' ).replace( ')', '' );
  const rawVM = getRawVerificationMethod( selectedVM, relationship );

  let print = `relationship: ${relationship}`;
  for( const key in selectedVM ) {
    print += `\n${key}: ${selectedVM[key]}`
  }

  const storedIndex = storedDID.verificationMethods?.findIndex( vm => getVMId(vm, vm.relationship) === getVMId(verificationMethod, relationship) )
  const storedVM = storedDID.verificationMethods?.splice( storedIndex, 1 )[0];
  if( storedIndex ) print += `\nprivateKey: ${storedVM.privateKey}`;

  message.info( print );

  const { option } = await inquirer.prompt( [{
    type: 'list',
    name: 'option',
    message: verificationMethod,
    choices: [
      'Revoke',
      'Go Back',
    ]
  }] );

  if( option === 'Revoke' ) {
    const tx = await did.revokeVerificationMethod( rawVM );
    message.info( `Tx Hash: ${tx.transactionHash}` );
    set( did.id, storedDID );

    await inquirer.prompt([{
      name: 'key',
      type: 'press-to-continue',
      anyKey: true,
      pressToContinueMessage: 'Press a key to continue...',
    }]);
  }

  await listVM( ui, did );
}

export async function createVM( ui, did ) {
  const controllers = await did.getControllers();
  const vm = await inquirer.prompt( [{
    type: 'list',
    name: 'relationship',
    message: `Relationship`,
    choices: Object.keys(relationships),
    filter: value => relationships[value]
  }, {
    type: 'confirm',
    name: 'providePK',
    message: `Do you have the public key?`,
  }, {
    type: 'list',
    name: 'type',
    message: `Select the algorithm to generate a new key-pair`,
    choices: Object.keys(types),
    filter: value => types[value],
    when(answers) {
      return !answers.providePK;
    }
  }, {
    type: 'list',
    name: 'type',
    message: `Algorithm`,
    choices: Object.keys(keyAlgorithms),
    filter: value => keyAlgorithms[value],
    when(answers) {
      return answers.providePK;
    }
  }, {
    type: 'list',
    name: 'encoding',
    message: `Encoding`,
    choices: Object.keys(encodings),
    filter: value => encodings[value],
    when(answers) {
      return answers.providePK;
    }
  }, {
    type: 'input',
    name: 'publicKey',
    message: 'Enter Public Key (or path to .pem)',
    when(answers) {
      return answers.providePK;
    }
  }, {
    type: 'input',
    name: 'privateKey',
    message: 'Enter Private Key (Optional)',
    when(answers) {
      return answers.providePK;
    }
  }, {
    type: 'input',
    name: 'expires',
    message: 'Expiration (seconds)',
    validate(value) {
      const valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
    filter: Number,
  }, {
    type: 'autocomplete',
    name: 'controller',
    message: 'Controller',
    source: () => controllers,
  } ] );

  if( !vm.providePK ) {
    const generated = await {
      zkp: async() => {
        const bbsKeyPair = await bbs.Bls12381G2KeyPair.generate({ id: did.id, controller: did.id } );
        return {
          algorithm: 'esecp256k1vk',
          encoding: 'base58',
          publicKey: bbsKeyPair.publicKey,
          privateKey: bbsKeyPair.privateKey
        }
      },
      eth: async () => {
        const kp = createKeyPair();
        return {
          algorithm: 'esecp256k1vk',
          encoding: 'blockchain',
          publicKey: `0x${kp.address}`,
          privateKey: kp.privateKey
        }
      },
      x509: async () => {
        const { publicKey, privateKey } = await generateKeyPairSync('rsa', {
              modulusLength: 2048,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });
        return {
          algorithm: 'rsavk',
          encoding: 'pem',
          publicKey,
          privateKey
        }
      },
      enc: async () => {
        const kp = await generateEncryptionKeyPair();
        return {
          algorithm: 'x25519ka',
          encoding: 'hex',
          publicKey: `0x${kp.publicKey}`,
          privateKey: kp.privateKey
        }
      }
    }[vm.type]();
    vm.algorithm = generated.algorithm;
    vm.encoding = generated.encoding;
    vm.publicKey = generated.publicKey;
    vm.privateKey = generated.privateKey;
    message.info(`Generated Key Pair:
   Public Key: ${generated.publicKey}
   Private Key: ${generated.privateKey}
   Encoding: ${generated.encoding}`);
  }

  const storedDID = await get( did.id );
  const tx = await did.addVerificationMethod( {
    type: vm.relationship,
    algorithm: vm.algorithm,
    encoding: vm.encoding,
    publicKey: vm.publicKey,
    controller: vm.controller,
    expiration: vm.expires
  } );
  if( !storedDID.verificationMethods ) storedDID.verificationMethods = [];
  storedDID.verificationMethods.push(vm);
  message.info(`Tx Hash: ${tx.transactionHash}`);
  set( did.id, storedDID );

  await inquirer.prompt([{
    name: 'key',
    type: 'press-to-continue',
    anyKey: true,
    pressToContinueMessage: 'Press a key to continue...',
  }]);

  await listVM( ui, did );
}