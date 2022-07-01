import inquirer from "inquirer";
import PressToContinuePrompt from 'inquirer-press-to-continue';
import inquirerPrompt from "./autocomplete.js";
import list from "./list.js";
import create from "./create.js";
import resolve from "./resolve.js";
import { init } from "./storage.js";
import { generateToken } from "./authentication.js";

inquirer.registerPrompt('press-to-continue', PressToContinuePrompt);
inquirer.registerPrompt('autocomplete', inquirerPrompt);

const ui = new inquirer.ui.BottomBar( { bottomBar: '' } );

init();

export const main = async () => inquirer.prompt( [{
  type: 'list',
  name: 'option',
  message: 'What do you want to do?',
  choices: [
    'List (View all DIDs)',
    'Create (Generate new DID)',
    'Resolve (Resolve DID Document)',
    new inquirer.Separator(),
    'Authentication Token',
    new inquirer.Separator(),
    '<Exit>',
    new inquirer.Separator(),
  ],
}] ).then( async ( { option } ) => {
  switch( option ) {
    case 'List (View all DIDs)':
      await list(ui);
      break;
    case 'Create (Generate new DID)':
      await create(ui);
      break;
    case 'Resolve (Resolve DID Document)':
      await resolve(ui);
      break;
    case 'Authentication Token':
      await generateToken(ui);
      break;
    case '<Exit>':
      process.exit(0);
      break;
  }
} );

main();