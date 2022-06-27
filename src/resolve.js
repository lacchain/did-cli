import inquirer from "inquirer";
import message from "bit-message-box";
import { DID } from "@lacchain/did";
import config from "./config.js";
import { main } from "./main.js";

export default async function( ui ) {
  const { did } = await inquirer.prompt( [{
    type: 'input',
    name: 'did',
    message: 'DID'
  } ] );

  const address = did.split( ':' ).slice( -1 )[0];
  const readOnlyDID = new DID( { ...config, address } );

  message.info( JSON.stringify( await readOnlyDID.getDocument(), null, 2 ) );

  await inquirer.prompt([{
    name: 'key',
    type: 'press-to-continue',
    anyKey: true,
    pressToContinueMessage: 'Press a key to continue...',
  }]);

  await main();
}