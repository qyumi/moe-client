// Log presence updates like a new status or starting a game

import { Channel, MessageAttachment, MessageEmbed, Presence, TextChannel } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';

export const run: RunEvent = async (
  client: MoeClient,
  oldPresence: Presence,
  newPresence: Presence
) => {
  const message_logchannel_id = process.env.EVENT_LOG!
  const new_user = newPresence.member!.user;
  const raw_new_data = new MessageAttachment(Buffer.from(JSON.stringify(newPresence, null, 4)), 'new.json');
  const raw_old_data = new MessageAttachment(Buffer.from(JSON.stringify(oldPresence, null, 4)), 'old.json');
  const logchannel: TextChannel | Channel = await client.channels.fetch(message_logchannel_id);

  const Embed = new MessageEmbed()
    .setAuthor(new_user.tag, new_user.displayAvatarURL())
    .setDescription(`**User <@${new_user.id}> updated its presence**`)
    .addField('Old status', oldPresence.status)
    .addField('New status', newPresence.status)
    .setColor(0x03fcb1)
    .setTimestamp();

  await (logchannel as TextChannel).send('', { embed: Embed, files: [raw_old_data, raw_new_data] });
};

export const name: string = 'presenceUpdate';
