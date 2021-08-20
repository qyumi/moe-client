// Basic gateway ready listener (somehow has no output)

import { MoeClient } from '../clients/MoeClient';
import { RunEvent } from '../interfaces/Event';

/*
* Event gets triggered and function is executed but no output is given.
* Maybe due to MongoDB
*/
export const run: RunEvent = async (client: MoeClient) => {
  client.logger.info(`Logged in as ${client.user?.username}!`);
};

export const name: string = 'ready';
