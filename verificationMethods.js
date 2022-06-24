import inquirer from "inquirer"
import { get, set } from "./storage.js";
import view from "./view.js";

export default async function(ui, did) {
  const document = await did.getDocument();

  const { vm } = await inquirer.prompt( [{
    type: 'list',
    name: 'vm',
    message: `${did.id}@verificationMethods`,
    choices: [
      {
        name: 'Assertion Methods',
        disabled: 'assertionMethod',
      },
      ...document.assertionMethod.map( vm => `${vm.id}(${vm.type})` ),
      new inquirer.Separator(),
      {
        name: 'Authentication Methods',
        disabled: 'authentication',
      },
      ...document.authentication.map( vm => `${vm.id}(${vm.type})` ),
      new inquirer.Separator(),
      {
        name: 'Key Agreement',
        disabled: 'encryption',
      },
      ...document.keyAgreement.map( vm => `${vm.id}(${vm.type})` ),
      new inquirer.Separator(),
      {
        name: 'Capability Invocation',
        disabled: 'capabilityInvocation',
      },
      ...document.capabilityInvocation.map( vm => `${vm.id}(${vm.type})` ),
      new inquirer.Separator(),
      {
        name: 'Capability Delegation',
        disabled: 'capabilityDelegation',
      },
      ...document.capabilityDelegation.map( vm => `${vm.id}(${vm.type})` ),
      new inquirer.Separator()
    ],
    pageSize: 10
  }] );

  await view( ui, did.id );
}