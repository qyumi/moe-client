// Database model for the message object

import mongoose, { Document, Schema } from 'mongoose';

interface IMessage extends Document {
  _id: string;
  channel_id: string;
  guild_id: string;
  user_id: string;
  user_status: string;
  content: string;
  attachment: boolean;
  updated: boolean;
  deleted: boolean;
  raw_message: object;
  raw_channel: object;
  raw_guild: object;
  raw_user: object;
  raw_user_client_status: object;
  raw_user_activities: object;
}

const MessageSchema: Schema = new Schema({
  _id: { type: String, required: true },
  channel_id: { type: String, required: true },
  guild_id: { type: String, required: false },
  user_id: { type: String, required: true },
  user_status: { type: String, required: true },
  content: { type: String, required: false },
  attachment: { type: Boolean, required: true },
  updated: { type: Boolean, required: true },
  deleted: { type: Boolean, required: true },
  raw_message: { type: Object, required: false },
  raw_channel: { type: Object, required: false },
  raw_guild: { type: Object, required: false },
  raw_user: { type: Object, required: false },
  raw_user_client_status: { type: Object, required: false },
  raw_user_activities: { type: Object, required: false }
},
{
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);