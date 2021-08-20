// Log typing start events

import { Channel, MessageEmbed, TextChannel, User } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';

export const run: RunEvent = async (
  client: MoeClient,
  channel: TextChannel,
  user: User
) => {
  const user_status = user.presence.status;
  const message_logchannel_id = process.env.EVENT_LOG!;

  const Embed = new MessageEmbed()
    .setAuthor(user.tag, user.displayAvatarURL())
    .setDescription(`**User <@${user.id}> started typing in channel <#${channel.id}>**`)
    .addField('User status', user_status)
    .setColor(0x007bff)
    .setTimestamp();

  let logchannel: TextChannel | Channel = await client.channels.fetch(message_logchannel_id);
  await (logchannel as TextChannel).send('', { embed: Embed });
};

export const name: string = 'typingStart';
