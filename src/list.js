import inquirer from "inquirer";
import { load } from "./storage.js";
import view from "./view.js";
import create from "./create.js";
import { main } from "./main.js";

export default async function( ui ) {
  const dids = await load();

  if( dids.length <= 0 ){
    console.log('There is no any DID generated yet');
    dids.push( 'Create DID' );
  }
  dids.push( new inquirer.Separator() );
  dids.push( 'Go Back' );

  const { did } = await inquirer.prompt( [{
    type: 'list',
    name: 'did',
    message: 'Select one DID to view more options:',
    choices: dids
  }] );
  if( did === 'Go Back' ) {
    await main();
  } if( did === 'Create DID' ) {
    await create( ui );
  } else {
    await view( ui, did );
  }
}