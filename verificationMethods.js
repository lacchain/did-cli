import inquirer from "inquirer"
import { get, set } from "./storage.js";
import view from "./view.js";
import { getVerificationMethod } from "./util.js";

export default async function( ui, did ) {
  const document = await did.getDocument();
  const storedDID = await get( did.id );

  const { verificationMethod } = await inquirer.prompt( [{
    type: 'list',
    name: 'verificationMethod',
    message: `${did.id}@verificationMethods`,
    choices: [
      ...document.assertionMethod.map( vm => `${vm.id} (assertionMethod)` ),
      ...document.authentication.map( vm => `${vm.id} (authentication)` ),
      ...document.keyAgreement.map( vm => `${vm.id} (keyAgreement)` ),
      ...document.capabilityInvocation.map( vm => `${vm.id} (capabilityInvocation)` ),
      ...document.capabilityDelegation.map( vm => `${vm.id} (capabilityDelegation)` )
    ],
    pageSize: 10
  }] );

  const selectedVM = document.verificationMethod.find( vm => verificationMethod.startsWith( vm.id ) );
  const purpose = verificationMethod.split( ' ' )[1].replace( '(', '' ).replace( ')', '' );
  const rawVM = getVerificationMethod( selectedVM, purpose );
  for( const key in selectedVM ) {
    console.log( `${key}: ${selectedVM[key]}` );
  }
  console.log( `purpose: ${purpose}` );

  const storedIndex = storedDID.verificationMethods?.findIndex( vm => verificationMethod.toLowerCase().startsWith( vm.id.toLowerCase() ) )
  const storedVM = storedDID.verificationMethods?.splice( storedIndex, 1 );
  if( storedIndex ) console.log( `privateKey: ${storedVM.privateKey}` );

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
    console.log( tx.transactionHash );
    set( did.id, storedDID );
  }

  await view( ui, did.id );
}