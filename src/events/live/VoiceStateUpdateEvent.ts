// Log voice state update events ex. joining a channel, leaving, muting

import { Channel, MessageEmbed, TextChannel, VoiceState } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';

export const run: RunEvent = async (
  client: MoeClient,
  oldVoiceState: VoiceState,
  newVoiceState: VoiceState
) => {
  const user = newVoiceState.member!.user;
  const user_status = user.presence.status;
  const message_logchannel_id = process.env.VOICE_LOG!;
  const logchannel: TextChannel | Channel = await client.channels.fetch(message_logchannel_id);
  const Embed = new MessageEmbed().setAuthor(user.tag, user.displayAvatarURL());

  if (newVoiceState.channel?.id != undefined) {
    Embed.setDescription(`**<@${user.id}> joined voice channel <#${newVoiceState.channel?.id}>**`)
      .setFooter(`User ID: ${user.id} | Voice Channel ID: ${newVoiceState.channel?.id}`)
      .addField('Muted', newVoiceState.mute)
      .addField('Deaf', newVoiceState.deaf)
      .addField('Streaming', newVoiceState.streaming);
  } else {
    Embed.setDescription(`**<@${user.id}> left voice channel <#${oldVoiceState.channel?.id}>**`)
      .setFooter(`User ID: ${user.id} | Voice Channel ID: ${oldVoiceState.channel?.id}`);
  }

  Embed.addField('User status', user_status)
    .setColor(0xfc5203)
    .setTimestamp();

  await (logchannel as TextChannel).send('', { embed: Embed });
};

export const name: string = 'voiceStateUpdate';
