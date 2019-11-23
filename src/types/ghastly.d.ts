/* eslint-disable */

declare module 'ghastly/command' {
  class Response {
    private executor: () => Promise<any>;

    constructor(executor);

    respond(): Promise<any>;
  }

  class VoiceResponse {
    constructor(context: object, inputMethod: string, payload: any, options?: object);
  }
}
