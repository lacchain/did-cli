import inquirer from "inquirer"
import { get, set } from "./storage.js";
import view from "./view.js";

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
    } )
  }] );
  const storedController = storedDID.controllers.find( c => controller.toLowerCase().endsWith( c.address.toLowerCase() ) )
  if( storedController && !controller.startsWith("*") ){
    console.log( `Controller: ${controller}` );
    console.log( `Private Key: ${storedController.privateKey}` );
    const { option } = await inquirer.prompt( [{
      type: 'list',
      name: 'option',
      message: `${did.id}@${controller}`,
      choices: [
          'Set as Default',
          'Revoke Controller'
      ]
    }] );
    if( option === 'Set as Default' ){
      const tx = await did.changeController( controller );
      console.log(tx.transactionHash);
    } else if( option === 'Revoke Controller' ){
      if( controller.toLowerCase().endsWith(currentController.toLowerCase()) ){
        console.log('Unable to revoke current controller. First, add or change main controller');
      } else {
        const tx = await did.removeController( controller );
        storedDID.controller = storedDID.controllers.filter( c => c.address !== storedController.address );
        set( did.id, storedDID );
        console.log(tx.transactionHash);
      }
    }
  } else {
    console.log( `Controller: ${controller}` );
    if( storedController ) console.log( `Private Key: ${storedController.privateKey}` );
    await inquirer.prompt( [{
      type: 'list',
      name: 'option',
      message: `${did.id}@${controller}}`,
      choices: [
        'Go back'
      ]
    }] );
  }

  await view( ui, did.id );
}