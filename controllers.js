import inquirer from "inquirer"
import { get, set } from "./storage.js";
import view from "./view.js";
import message from "bit-message-box";

export default async function(ui, did) {
  const controllers = await did.getControllers();
  const currentController = await did.getController();
  const storedDID = await get(did.id);
  const { controller } = await inquirer.prompt( [{
    type: 'list',
    name: 'controller',
    message: `${did.id}@controllers`,
    choices: controllers.map( address => {
      if(address.toLowerCase() === currentController.toLowerCase())
        return `* ${address}`;
      return address;
    } ),
    filter: value => ({
      address: value.replace('* ', '').toLowerCase(),
      isCurrent: value.startsWith("*")
    })
  }] );
  const storedController = storedDID.controllers.find( c => controller.address.endsWith( c.address.toLowerCase() ) )
  message.info( `Controller: ${controller.address}${storedController ? `\nPrivate Key: ${storedController.privateKey}` : ''}
Current Active: ${controller.isCurrent}` );
  if( storedController && !controller.isCurrent ){
    const { option } = await inquirer.prompt( [{
      type: 'list',
      name: 'option',
      message: `${did.id}@${controller.address}`,
      choices: [
          'Set as Default',
          'Revoke Controller'
      ]
    }] );
    if( option === 'Set as Default' ){
      const tx = await did.changeController( controller.address );
      message.info(`Tx Hash: ${tx.transactionHash}`);
    } else if( option === 'Revoke Controller' ){
      if( controller.address.endsWith(currentController.toLowerCase()) ){
        message.error('Unable to revoke current controller. First, add or change main controller');
      } else {
        const tx = await did.removeController( controller.address );
        storedDID.controller = storedDID.controllers.filter( c => c.address !== storedController.address );
        set( did.id, storedDID );
        message.info(`Tx Hash: ${tx.transactionHash}`);
      }
    }
  }

  await inquirer.prompt([{
    name: 'key',
    type: 'press-to-continue',
    anyKey: true,
    pressToContinueMessage: 'Press a key to continue...',
  }]);

  await view( ui, did.id );
}