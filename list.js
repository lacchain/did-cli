import inquirer from "inquirer";
import { load } from "./storage.js";
import view from "./view.js";

export default async function(ui) {
  const dids = await load();

  if( dids.length <= 0 ){
    console.log('There is no any DID generated yet');
    dids.push( 'Create DID' );
  }
  const { did } = await inquirer.prompt( [{
    type: 'list',
    name: 'did',
    message: 'Select one DID to view more options:',
    choices: dids
  }] );
  if( did === 'Create DID' ) {
    console.clear();
    await parent();
  } else {
    await view( ui, did );
  }
}