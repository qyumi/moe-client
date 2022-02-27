// Basic message update event listener, sends logs to the log channel and
// updates them inside the database

import { Channel, Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';
import Attachments from '../../models/Attachment'; 
import Messages from '../../models/Message';

export const run: RunEvent = async (client: MoeClient, _: Message, new_message: Message) => {
  client.logger.info(`Message updated: ${new_message.id}`);
  let old_message = null;
  let file = null;
  let has_attachment = false;

  old_message = await Messages.findById(new_message.id).exec();
  file = await Attachments.findById(new_message.id).exec();

  if (old_message == null || new_message == null) return;
  if (old_message.content == new_message.content) return;
  if (file != null || file != undefined) has_attachment = true;

  const channel_id = process.env.MESSAGE_LOG!;
  const channel: TextChannel | Channel = await client.channels.fetch(channel_id.toString());
  const user_id = old_message.user_id.toString();
  const user = await client.users.fetch(user_id);

  try {
    await Messages.updateOne({ _id: new_message.id }, { content: new_message.content, raw_message: new_message.toJSON(), updated: true });
  } catch (err) {
    client.logger.error(err)
  }

  const Embed = new MessageEmbed()
    .setAuthor(user.tag, user.displayAvatarURL())
    .setDescription(`**[Message](${new_message.url}) sent by <@${user.id}> updated in <#${new_message.channel.id}>**`)
    .addField('Old message', old_message.content)
    .addField('New message', new_message.content)
    .setFooter(`Message ID: ${old_message._id} | User ID: ${old_message.user_id}`)
    .setColor(0xecf71e)
    .setTimestamp();

  if (has_attachment) {
    let params = {
      Bucket: process.env.S3_BUCKET!,
      Key: `${new_message.guild?.id}/${new_message.id}`
    }

    if (file?.filetype != undefined) {
      params.Key = `${new_message.guild?.id}/${new_message.id}.${file.filetype}`
    }

    /*
    * Get object data.
    * It is possible for the client to insert data about an attachment into the database but
    * not getting the binary data in time to upload it to the S3 bucket.
    * Never happened in practice but could happen in theory.
    */
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
