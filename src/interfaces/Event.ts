// Event interface that makes it possible to pass the Discord client
// to events like MessageCreate

import { MoeClient } from '../clients/MoeClient';

export interface RunEvent {
  (client: MoeClient, ...params: any[]): Promise<unknown>;
}

export interface Event {
  name: string;
  run: RunEvent;
}
