// Log voice state update events ex. joining a channel, leaving, muting

import { Channel, MessageEmbed, TextChannel, VoiceState } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';

export const run: RunEvent = async (client: MoeClient, oldvs: VoiceState, newvs: VoiceState) => {
  const user = newvs.member!.user;
  const user_status = user.presence.status;
  const logchannel_id = process.env.VOICE_LOG!;
  const logchannel: TextChannel | Channel = await client.channels.fetch(logchannel_id);
  const Embed = new MessageEmbed().setAuthor(user.tag, user.displayAvatarURL());

  if (newvs.channel?.id != undefined) {

    for (let presence of newvs.member!.user.presence.activities) {
      if (presence.type == 'STREAMING' && newvs.streaming) {
        Embed.addField('Streaming', presence.name)
        break;
      }
    }

    Embed.setDescription(`**<@${user.id}> joined voice channel <#${newvs.channel?.id}>**`)
      .setFooter(`User ID: ${user.id} | Voice Channel ID: ${newvs.channel?.id}`)
      .addField('Muted', newvs.mute)
      .addField('Deaf', newvs.deaf)
  } else {
    Embed.setDescription(`**<@${user.id}> left voice channel <#${oldvs.channel?.id}>**`)
      .setFooter(`User ID: ${user.id} | Voice Channel ID: ${oldvs.channel?.id}`);
  }

  Embed.addField('User status', user_status)
    .setColor(0xfc5203)
    .setTimestamp();

  await (logchannel as TextChannel).send('', { embed: Embed });
};

export const name: string = 'voiceStateUpdate';
