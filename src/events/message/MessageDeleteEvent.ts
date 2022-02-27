// Basic message delete event listener, sends logs to the log channel

import { Channel, Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';
import Attachments from '../../models/Attachment';
import Messages from '../../models/Message';

export const run: RunEvent = async (client: MoeClient, message: Message) => {
  client.logger.info(`Message deleted: ${message.id}`);

  let deleted_message = null;
  let file = null;
  let has_attachment = false;

  deleted_message = await Messages.findById(message.id).exec();
  file = await Attachments.findById(message.id).exec();

  if (deleted_message == null) return;
  if (file != null) has_attachment = true;

  const channel_id = process.env.MESSAGE_LOG!;
  const channel: TextChannel | Channel = await client.channels.fetch(channel_id.toString());
  const user_id = deleted_message.user_id.toString();
  const user = await client.users.fetch(user_id);

  await Messages.updateOne({ _id: message.id }, { deleted: true });

  const Embed = new MessageEmbed()
    .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
    .setDescription(`**Message sent by <@${user.id}> deleted in <#${deleted_message!.channel_id}>**\n${deleted_message!.content}`)
    .setColor(0xa83242)
    .setFooter(`Message ID: ${deleted_message!._id} | User ID: ${deleted_message!.user_id}`)
    .setTimestamp();

  // Send the Embed to the specified logchannel if it has an attachment
  if (has_attachment) {
    let params = {
      Bucket: process.env.S3_BUCKET!,
      Key: `${deleted_message.guild_id}/${message.id}`
    }
  
    if (file?.filetype != undefined) {
      params.Key = `${deleted_message.guild_id}/${message.id}.${file.filetype}`
    }
  
    let attachment_data = client.s3client.getObject(params)
      .on('error', async err => {
        if (err.statusCode == 404) {
          Embed.setFooter(`${Embed.footer} | INFO: Database has information about an attachment but couldn't retrieve it from storage.`);
          return await (channel as TextChannel).send('', { embed: Embed });
        }
      }).createReadStream()

    const attachment = new MessageAttachment(attachment_data, file!.filename);
    await (channel as TextChannel).send('', {
      embed: Embed,
      files: [attachment]
    });
    
  } else {
    return await (channel as TextChannel).send('', { embed: Embed });
  }
};

export const name: string = 'messageDelete';
