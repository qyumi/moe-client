// Basic message update event listener, sends logs to the log channel and
// updates them inside the database

import { Channel, Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';
import Attachments from '../../models/Attachment'; 
import Messages from '../../models/Message';

export const run: RunEvent = async (client: MoeClient, _: Message, newmsg: Message) => {
  client.logger.info(`Message updated: ${newmsg.id}`);
  let oldmsg = null;
  let file = null;
  let has_attachment = false;

  oldmsg = await Messages.findById(newmsg.id).exec();
  file = await Attachments.findById(newmsg.id).exec();

  if (oldmsg == null || newmsg == null || oldmsg.content == newmsg.content) return;
  if (file != null || file != undefined) has_attachment = true;

  const channel_id = process.env.MESSAGE_LOG!;
  const channel: TextChannel | Channel = await client.channels.fetch(channel_id.toString());
  const user_id = oldmsg.user_id.toString();
  const user = await client.users.fetch(user_id);

  try {
    await Messages.updateOne({ _id: newmsg.id }, { content: newmsg.content, raw_message: newmsg.toJSON(), updated: true });
  } catch (err) {
    client.logger.error(err)
  }

  const Embed = new MessageEmbed()
    .setAuthor(user.tag, user.displayAvatarURL())
    .setDescription(`**[Message](${newmsg.url}) sent by <@${user.id}> updated in <#${newmsg.channel.id}>**`)
    .addField('Old message', oldmsg.content)
    .addField('New message', newmsg.content)
    .setFooter(`Message ID: ${oldmsg._id} | User ID: ${oldmsg.user_id}`)
    .setColor(0xecf71e)
    .setTimestamp();

  if (has_attachment) {
    let params = {
      Bucket: process.env.S3_BUCKET!,
      Key: `${newmsg.guild?.id}/${newmsg.id}`
    }

    if (file?.filetype != undefined) {
      params.Key = `${newmsg.guild?.id}/${newmsg.id}.${file.filetype}`
    }

    let attachment_data = client.s3client.getObject(params)
      .on('error', async err => {
        if (err.statusCode == 404) {
          Embed.setFooter(`${Embed.footer} | INFO: Database has information about an attachment but couldn't retrieve it from storage.`);
          return await (channel as TextChannel).send('', { embed: Embed });
        }
      }).createReadStream()

    const attachment = new MessageAttachment(attachment_data, file?.filename);
    await (channel as TextChannel).send('', {
      embed: Embed,
      files: [attachment]
    });
  } else {
    return await (channel as TextChannel).send('', { embed: Embed });
  }
};

export const name: string = 'messageUpdate';
