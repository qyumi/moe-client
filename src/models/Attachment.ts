// Database model for the message attachment object

import mongoose, { Document, Schema } from 'mongoose';

interface IAttachment extends Document {
  _id: string;
  filename: string;
  filetype: string;
  filesize: number;
}

const AttachmentSchema: Schema = new Schema({
  _id: { type: String, required: true },
  filename: { type: String, required: true },
  filetype: { type: String, required: false },
  filesize: { type: Number, required: true }
},
{
  timestamps: true
});

export default mongoose.model<IAttachment>('Attachment', AttachmentSchema);
