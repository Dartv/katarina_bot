import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { prop } from 'ramda';
import { RichEmbed } from 'discord.js';

import {
  getRandomPage,
  getRandomGalleryLink,
  getRandomImageLink,
  COMMAND_TRIGGERS,
  EH_URL,
  getHtml,
  getImageSrc,
} from '../util';
import { FileResponse, ErrorResponse } from './responses';
import { withCooldown } from './middleware';

export const middleware = [withCooldown(5000)];

export const handler = async (context) => {
  const { args: { query = '' } } = context;
  const URL = `${EH_URL}/?f_search=${query}&f_apply=${'Apply+Filter'}`;

  return fetch(URL)
  .then(getHtml)
  .then(cheerio.load.bind(cheerio))
  .then(getRandomPage)
  .then(page => `${URL}&page=${page}`)
  .then(fetch)
  .then(getHtml)
  .then(cheerio.load.bind(cheerio))
  .then(getRandomGalleryLink)
  .then(prop('url'))
  .then(async (galleryUrl) => {
    if (!galleryUrl) {
      return new ErrorResponse('Your search did not match anything', context);
    }

    const [,,,, gid, token] = galleryUrl.split('/');
    const data = await fetch('https://api.e-hentai.org/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'gdata',
        gidlist: [
          [gid, token],
        ],
        namespace: 1,
      }),
    });
    const {
      title,
      thumb,
      category,
      uploader,
      rating,
      tags,
      filecount,
    } = (await data.json()).gmetadata[0];

    const { index, url: imageUrl } = await fetch(galleryUrl)
      .then(getHtml)
      .then(cheerio.load.bind(cheerio))
      .then(getRandomPage)
      .then(page => `${galleryUrl}?p=${page}`)
      .then(url => fetch(url, {
        headers: {
          cookie: 'nw=1',
        },
      }))
      .then(getHtml)
      .then(cheerio.load.bind(cheerio))
      .then(getRandomImageLink);

    const embed = new RichEmbed();
    embed
      .setTitle(title)
      .addField('Category', category)
      .addField('Rating ⭐', rating)
      .addField('Uploader', uploader)
      .addField('Tags', tags.join(', '))
      .setURL(galleryUrl)
      .setThumbnail(thumb)
      .setAuthor(context.message.author.username, context.message.author.avatarURL)
      .setFooter(`Page: ${index + 1}/${filecount}`);

    await context.dispatch(embed);

    return fetch(imageUrl)
      .then(getHtml)
      .then(cheerio.load.bind(cheerio))
      .then(getImageSrc)
      .then(src => FileResponse('', [src], context))
      .catch(err => ErrorResponse(err.message, context));
  })
  .catch(err => ErrorResponse(err.message, context));
};

export default () => ({
  handler,
  middleware,
  parameters: [{
    name: 'query',
    description: 'search query',
    optional: true,
    repeatable: true,
    defaultValue: '',
  }],
  triggers: COMMAND_TRIGGERS.EHRANDOM,
  description: 'Posts random EH image from a random gallery',
});
