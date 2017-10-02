import { Response } from 'ghastly/command';

export default class FileResponse extends Response {
  constructor(content, files) {
    super(async ({ message }) => message.channel.send(content, { files }));
  }
}
