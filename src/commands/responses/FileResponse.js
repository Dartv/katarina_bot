import R from 'ramda';
import { Response } from 'ghastly/command';

export class FileResponse extends Response {
  constructor(content, files, { message }) {
    super(async () => message.channel.send(content, { files }));
  }
}

export default R.construct(FileResponse);
