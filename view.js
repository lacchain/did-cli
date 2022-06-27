import inquirer from "inquirer";
import config from "./config.js";
import { DID } from "@lacchain/did";
import { get } from "./storage.js";
import { listControllers, registerController } from "./controllers.js";
import { createVM, listVM } from "./verificationMethods.js";

async function getFullDID( did ){
  const address = did.split(':').slice(-1)[0];
  const readOnlyDID = new DID( { ...config, address } );
  const currentController = await readOnlyDID.getController();
  const storedDID = await get(readOnlyDID.id);
  const storedController = storedDID.controllers.find( c => c.address.toLowerCase() === currentController.toLowerCase() )
  if( !storedController ) throw new Error("Current controller private key not stored");
  readOnlyDID.setControllerKey( storedController.privateKey );
  return readOnlyDID;
}

export default async function(ui, did) {
  const _did = await getFullDID( did );
  const { option } = await inquirer.prompt( [{
    type: 'list',
    name: 'option',
    message: did,
    choices: [
      'View Controllers',
      'View Verification Methods',
      'View Services',
      new inquirer.Separator(),
      'Add Controller',
      'Add Verification Method',
      'Add Service',
      new inquirer.Separator(),
      'Resolve Document',
      new inquirer.Separator(),
    ]
  }] );
  switch( option ){
    case 'View Controllers':
      await listControllers(ui, _did);
      break;
    case 'View Verification Methods':
      await listVM( ui, _did );
      break;
    case 'View Services':
      const services = document.service || [];
      console.log( services );
      break;
    case 'Add Controller':
      await registerController( ui, _did );
      break;
    case 'Add Verification Method':
      await createVM( ui, _did );
      break;

  }
}