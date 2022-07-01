import inquirer from "inquirer"
import * as didJWT from "did-jwt";
import moment from "moment";
import { get, load } from "./storage.js";
import message from "bit-message-box";
import create from "./create.js";
import view, { getFullDID } from "./view.js";
import { getRawVerificationMethod, getVMId } from "./util.js";
import { main } from "./main.js";

export async function generateToken( ui ) {
  const dids = await load();

  const { audience } = await inquirer.prompt( [{
    type: 'input',
    name: 'audience',
    message: 'Enter the audicence DID'
  }] );

  if( dids.length <= 0 ){
    message.warn( "There is no any DID created yet." );
    await inquirer.prompt([{
      name: 'key',
      type: 'press-to-continue',
      anyKey: true,
      pressToContinueMessage: 'Press a key to create new DID...',
    }]);
    return await create( ui );
  }

  const { did } = await inquirer.prompt( [{
    type: 'list',
    name: 'did',
    message: 'Select the DID:',
    choices: dids
  }] );

  const _did = await getFullDID( did );
  const document = await _did.getDocument();

  if( document.authentication.length <= 0 ) {
    message.warn( "There is no Authentication Methods registered yet." );
    await inquirer.prompt([{
      name: 'key',
      type: 'press-to-continue',
      anyKey: true,
      pressToContinueMessage: 'Press a key to generate new Verification Method...',
    }]);
    return await view( ui, did );
  }

  const { authenticationMethod } = await inquirer.prompt( [{
    type: 'list',
    name: 'authenticationMethod',
    message: `${did}@authentication`,
    choices: document.authentication.map( vm => vm.id ),
    pageSize: 10
  }] );

  const selectedVM = document.authentication.find( vm => authenticationMethod.startsWith( vm.id ) );
  const rawVM = getRawVerificationMethod( selectedVM, 'authentication' );

  const storedDID = await get( did );
  const storedVM = storedDID.verificationMethods?.find( vm => getVMId(vm) === getVMId(rawVM) )
  if( !storedVM ){
    message.error( "It is not possible to get the private key of the selected authentication method" );
    process.exit(1);
  }

  if( storedVM.algorithm !== 'esecp256k1vk' ){
    message.warn( "Only Ethereum SECP256K1 algorithms is supported." );
    await inquirer.prompt([{
      name: 'key',
      type: 'press-to-continue',
      anyKey: true,
      pressToContinueMessage: 'Press a key to generate new Verification Method...',
    }]);
    return await view( ui, did );
  }

  const { expires } = await inquirer.prompt( [{
    type: 'input',
    name: 'expires',
    default: 3600,
    message: 'Expiration (seconds)',
    validate(value) {
      const valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
    filter: Number
  }] );

  const token = await didJWT.createJWT(
      { sub: did, aud: audience, exp: moment().add( expires, 'seconds' ).valueOf() },
      { issuer: did, signer: didJWT.ES256KSigner( storedVM.privateKey ) },
      { alg: 'ES256K' }
  );

  message.info( token );

  await inquirer.prompt([{
    name: 'key',
    type: 'press-to-continue',
    anyKey: true,
    pressToContinueMessage: 'Press a key to continue...',
  }]);

  await main( ui );
}