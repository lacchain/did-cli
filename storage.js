import { KeyvFile } from "keyv-file";


let storage;

export function init() {
  storage = new KeyvFile({
    filename: "storage.json", // the file path to store the data
    expiredCheckDelay: 24 * 3600 * 1000, // ms, check and remove expired data in each ms
    writeDelay: 100, // ms, batch write to disk in a specific duration, enhance write performance.
    encode: JSON.stringify, // serialize function
    decode: JSON.parse // deserialize function
  })
}

export function set( did, data ) {
  if( !storage ) throw new Error( 'Storage not initialized' );
  return storage.set( did, data )
}

export async function load() {
  if( !storage ) throw new Error( 'Storage not initialized' );
  return await storage.keys();
}

export function get( did ) {
  if( !storage ) throw new Error( 'Storage not initialized' );
  return storage.get( did );
}