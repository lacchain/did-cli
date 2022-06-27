import inquirer from "inquirer"
import view from "./view.js";
import message from "bit-message-box";

export async function listServices( ui, did ) {
  const document = await did.getDocument();
  const services = document.service || [];

  if( services.length <= 0 ){
    message.warn( "There is no Services registered yet" );
    await inquirer.prompt([{
      name: 'key',
      type: 'press-to-continue',
      anyKey: true,
      pressToContinueMessage: 'Press a key to continue...',
    }]);
    return await view( ui, did.id );
  }

  const { service } = await inquirer.prompt( [{
    type: 'list',
    name: 'service',
    message: `${did.id}@services`,
    choices: [
      ...services.map( service => `${service.type}` ),
      new inquirer.Separator(),
      'Go Back',
    ],
    pageSize: 10
  }] );

  if( service === 'Go Back' ) return await view( ui, did.id );

  const selectedService = services.find( svc => svc.type === service );

  message.info( `Type: ${selectedService.type}
Endpoint: ${selectedService.serviceEndpoint}` );

  const { option } = await inquirer.prompt( [{
    type: 'list',
    name: 'option',
    message: `${did.id}@${selectedService.type}`,
    choices: [
      'Revoke',
      'Go Back',
    ]
  }] );

  if( option === 'Revoke' ) {
    const tx = await did.revokeService( {
      type: selectedService.type,
      endpoint: selectedService.serviceEndpoint
    } );
    message.info( `Tx Hash: ${tx.transactionHash}` );

    await inquirer.prompt([{
      name: 'key',
      type: 'press-to-continue',
      anyKey: true,
      pressToContinueMessage: 'Press a key to continue...',
    }]);
  }

  await listServices( ui, did );
}

export async function registerService( ui, did ) {
 c

  await listServices( ui, did );
}