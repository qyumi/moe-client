// Basic message create event listener

import { Message, MessageAttachment } from 'discord.js';
import { MoeClient } from '../../clients/MoeClient';
import { RunEvent } from '../../interfaces/Event';
import Messages from '../../models/Message';

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
};

export const name: string = 'message';
