import crypto from "crypto";
import bs58 from "bs58";

export const types = {
  'Zero-Knowledge Proof (BBS+)': 'zkp',
  'Ethereum (SECP256K1)': 'eth',
  'X.509 (RSA)': 'x509',
  'Encryption (NaCl)': 'enc'
}

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

export const relationships = {
  assertionMethod: 'asse',
  authentication: 'auth',
  keyAgreement: 'keya',
  capabilityDelegation: 'dele',
  capabilityInvocation: 'invo'
};

export const encodings = {
  'Hexadecimal': 'hex',
  'Base 64': 'base64',
  'Base 58': 'base58',
  'PEM': 'pem'
}

export function getVMId( vm ) {
  return crypto.createHash( 'sha256' ).update( `${vm.relationship || vm.type}/${vm.controller}/${vm.algorithm}/${vm.encoding}/${vm.publicKey}` ).digest( 'hex' );
}

export function getRawVerificationMethod( vm, relationship ) {
  const verificationMethod = {
    type: relationships[relationship] || 'vm',
    algorithm: `${keyAlgorithms[vm.type]}`,
    controller: vm.controller
  }
  if( vm.blockchainAccountId ){
    verificationMethod.encoding = 'blockchain';
    verificationMethod.publicKey = vm.blockchainAccountId;
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