// Basic message create event listener

import { Message, MessageAttachment } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';
import Messages from '../../models/Message';
import Attachments from '../../models/Attachment';

export const run: RunEvent = async (client: MoeClient, message: Message) => {
  if (message.author.bot || message.channel.type == 'dm') return;
  client.logger.info(`Message created: ${message.id}`);

  let has_attachment: boolean = false;

  if (message.attachments.first() != undefined) {
    has_attachment = true;

    await client.s3client.upload_object(client, message);
  }

  // Insert message into database
  try {
    await Messages.create({
      _id: message.id,
      channel_id: message.channel.id,
      guild_id: message.guild!.id,
      user_id: message.author.id,
      user_status: message.author.presence.status,
      content: message.content,
      attachment: has_attachment,
      updated: false,
      deleted: false,
      raw_message: message.toJSON(),
      raw_channel: message.channel.toJSON(),
      raw_guild: message.guild!.toJSON(),
      raw_user: message.author.toJSON(),
      raw_user_client_status: Object(message.author.presence.clientStatus),
      raw_user_activities: message.author.presence.activities,
    });
  } catch (err) {
    client.logger.error(err);
  }

  // TODO: Move this command to a different file
  if (message.member?.hasPermission('MANAGE_MESSAGES')) {
    if (message.content.startsWith('moe log full')) {
      const args = message.content.split(' ');
      const message_id = args[3];
      const data = await Messages.findById(message_id).exec();

      if (data == null) {
        return await message.channel.send(`No entry found for ${message_id}`);
      } else {
        client.logger.info(`${message.author.id} requested data for ${message_id}`);

        let log_entry = new MessageAttachment(Buffer.from(JSON.stringify(data.toJSON(), null, 4)), `ENTRY_${message_id}.json`);

        if (data.attachment) {
          let file_data = await Attachments.findById(message_id).exec();
          let file_name = `${file_data?.filename}`;

          if (file_data?.filetype == undefined) {
            file_name = file_data!.filename;
          }

          let url: string = `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/${message.guild!.id}/${message_id}.${file_data!.filetype}`;
          if (file_data!.filetype == null) {
            url = `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/${message.guild!.id}/${message_id}`;
          }

          client.logger.info(url);

          return (
            await message.author.createDM()
          ).send(`Log requested for ${message_id}:`, {
            files: [log_entry, 
            {
              name: file_data?.filename,
              attachment: url,
            }
            ],
          });
        }

        await (await message.author.createDM()).send(`Log requested for ${message_id}:`, log_entry);
      }
    }
  }
};

export const name: string = 'message';
