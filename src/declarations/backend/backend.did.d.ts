import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Backend {
  'retrieveMessage' : ActorMethod<[Principal], [] | [message]>,
  'storeMessage' : ActorMethod<[message], undefined>,
}
export interface message { 'guildId' : string, 'discordId' : string }
export interface _SERVICE extends Backend {}
