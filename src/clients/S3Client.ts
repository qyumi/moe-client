// The Simple Storage Service client that gets passed through the whole project
// alongside the Discord client

import S3, { PutObjectRequest } from 'aws-sdk/clients/s3';
import { Message } from 'discord.js';
import { MoeClient } from './MoeClient';
import fetch from 'node-fetch';
import Attachments from '../models/Attachment';

class S3Client extends S3 {
  constructor() {
    super({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      }
    });
  }

  /**
   * Get the file type of an attachment
   * 
   * @param filename String returned from MessageAttachment.name
   * @returns Promise
   */  
  async get_filetype(filename: string): Promise<string | undefined> {
    if (!filename.includes('.')) {
      return undefined;
    }

    return filename.split('.').pop();
  }

  /**
   * Upload an object to the S3 bucket
   * 
   * @param client Discord client
   * @param message Message data (can be from create and update message event)
   */
  public async upload_object(client: MoeClient, message: Message) {
    const file_type = await this.get_filetype(message.attachments.first()?.name!);
    const url = message.attachments.first()!.url;
    let upload_string = `${message.guild?.id}/${message.id}.${file_type}`;

    if (file_type == undefined) {
      upload_string = `${message.guild?.id}/${message.id}`;
    }

    // Get data from attachment and set upload parameters
    fetch(url).then((res) => {
      let params: PutObjectRequest = {
        Bucket: process.env.S3_BUCKET!,
        Key: upload_string,
        Body: res.body!,
      };

      // Upload
      client.s3client.upload(params, async (err: any) => {
        if (err != null) {
          client.logger.error(err);
        } else {
          await Attachments.create({
            _id: message.id,
            filename: message.attachments.first()!.name!,
            filetype: file_type,
            filesize: message.attachments.first()?.size
          });

          client.logger.success(`Added file ${message.id} to bucket of ${message.guild?.id}`);
        }
      });
    });
  }
}
export default S3Client;
