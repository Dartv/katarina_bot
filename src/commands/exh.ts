import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { prop, tap } from 'ramda';
import { RichEmbed } from 'discord.js';

import {
  getRandomPage,
  getRandomGalleryLink,
  getRandomImageLink,
  // COMMAND_TRIGGERS,
  EH_API_URL,
  getHtml,
  getImageSrc,
} from '../util';
import { FileResponse, ErrorResponse } from './responses';
import { withCooldown } from './middleware';

const {
  EXH_URL,
  EH_MEMBER_ID,
  EH_PASS_HASH,
} = process.env;

export const middleware = [withCooldown(5000)];

export const handler = async (context) => {
  let cookie = `ipb_member_id=${EH_MEMBER_ID}; ipb_pass_hash=${EH_PASS_HASH};`;
  const { args: { query = '' } } = context;
  // eslint-disable-next-line max-len
  const URL = `${EXH_URL}/?f_search=${query}&f_apply=Apply+Filter&advsearch=1&f_sname=on&f_stags=on&f_sr=on&f_srdd=4`;

  return fetch(URL, {
    headers: {
      cookie,
    },
  })
    .then(tap((res) => {
      (res as any).headers.raw()['set-cookie'].map(c => c.split(';')[0]).forEach((c) => {
        cookie += ` ${c};`;
      });
    }))
    .then(getHtml)
    .then(cheerio.load.bind(cheerio))
    .then(getRandomPage)
    .then(page => `${URL}&page=${page}`)
    .then(fetch)
    .then(tap(console.log))
    .then(getHtml)
    .then(cheerio.load.bind(cheerio))
    .then(getRandomGalleryLink)
    .then(prop('url'))
    .then(async (galleryUrl) => {
      if (!galleryUrl) {
        return ErrorResponse('Your search did not match anything', context);
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

      const { index, url: imageUrl } = await fetch(galleryUrl, {
        headers: {
          cookie,
        },
      })
        .then(getHtml)
        .then(cheerio.load.bind(cheerio))
        .then(getRandomPage)
        .then(page => `${galleryUrl}?p=${page}`)
        .then(url => fetch(url, {
          headers: {
            cookie: `nw=1; ${cookie}`,
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

      return fetch(imageUrl, {
        headers: {
          cookie,
        },
      })
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
  triggers: ['exh'],
  description: 'Posts random EXH image from a random gallery',
});
