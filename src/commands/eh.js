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
  EH_API_URL,
  getHtml,
  getImageSrc,
} from '../util';
import { FileResponse, ErrorResponse } from './responses';
import { withCooldown } from './middleware';

export const middleware = [withCooldown(5000)];

export const handler = async (context) => {
  const { args: { query = '' } } = context;
  const URL = `${EH_URL}/?f_search=${query}&f_doujinshi=1&f_manga=1&f_artistcg=1&f_gamecg=1&f_western=1&f_non-h=0&f_imageset=1&f_cosplay=1&f_asianporn=0&f_misc=1&f_apply=Apply+Filter&advsearch=1&f_sname=on&f_stags=on&f_sr=on&f_srdd=4`;

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
    const data = await fetch(EH_API_URL, {
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
  triggers: COMMAND_TRIGGERS.EH,
  description: 'Posts random EH image from a random gallery',
});
