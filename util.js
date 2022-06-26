import crypto from "crypto";
import bs58 from "bs58";

export const keyAlgorithms = {
  'JsonWebKey2020': 'jwk',
  'EcdsaSecp256k1VerificationKey2019': 'esecp256k1vk',
  'EcdsaSecp256k1RecoveryMethod2020': 'esecp256k1rm',
  'Ed25519VerificationKey2018': 'edd25519vk',
  'GpgVerificationKey2020': 'gpgvk',
  'RsaVerificationKey2018': 'rsavk',
  'X25519KeyAgreementKey2019': 'x25519ka',
  'SchnorrSecp256k1VerificationKey2019': 'ssecp256k1vk'
}

const types = {
  assertionMethod: 'asse',
  authentication: 'auth',
  keyAgreement: 'keya',
  capabilityDelegation: 'dele',
  capabilityInvocation: 'invo'
};

export function getVMId( vm ) {
  return crypto.createHash( 'sha256' ).update( `${vm.type}/${vm.controller}/${vm.algorithm}/${vm.encoding}/${vm.publicKey}` ).digest( 'hex' );
}

export function getVerificationMethod( vm, purpose ) {
  const verificationMethod = {
    type: types[purpose] || 'vm',
    algorithm: `${keyAlgorithms[vm.type]}`,
    controller: vm.controller
  }
  if( vm.publicKeyHex ){
    verificationMethod.encoding = 'hex';
    verificationMethod.publicKey = `0x${vm.publicKeyHex}`;
  }
  if( vm.publicKeyBase64 ){
    verificationMethod.encoding = 'base64';
    verificationMethod.publicKey = Buffer.from( vm.publicKeyBase64, 'base64' );
  }
  if( vm.publicKeyBase58 ) {
    verificationMethod.encoding = 'base58';
    verificationMethod.publicKey = bs58.decode( vm.publicKeyBase58 ).toString('hex');
  }
  if( vm.publicKeyPem ) {
    verificationMethod.encoding = 'pem';
    verificationMethod.publicKey = vm.publicKeyPem;
  }
  return verificationMethod;
}