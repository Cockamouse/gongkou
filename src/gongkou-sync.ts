import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as bluebird from 'bluebird';
import * as fs from 'fs';
import * as _ from 'lodash';
import { baseUrl, Album, Albums } from './defines';

const getListUrl = (url: string) => `${baseUrl}/${url}`;
const getAlbumUrl = (id: number) => `${baseUrl}/${id}.html`;
const getPageUrl = (id: number, i?: number) => {
  if (i === undefined) return `${baseUrl}/${id}.html`;
  return `${baseUrl}/${id}_${i}.html`
};

function downloadImage(imgUrl: string, localPath: string): void {
  console.log(imgUrl);
}

async function openUrl(url, depth = 0): Promise<CheerioStatic> {
  try {
    const html: string = await rp(url);
    const $ = cheerio.load(html);
    return $;
  } catch (error) {
    console.log(`Error in ${url}`);
    return depth > 5 ? Promise.resolve(cheerio.load('')) : await openUrl(url, depth + 1);
  }
}

async function extractImage(id: number, i: number, depth: number = 0): Promise<string[]> {
  const images: string[] = [];
  const pageUrls = [getPageUrl(id, i)];
  i === 1 && pageUrls.push(getPageUrl(id));
  await pageUrls.forEach(async (pageUrl) => {
    const $ = await openUrl(pageUrl);
    const imgUrl = $('.tcontent img').attr('src');
    //console.log(pageUrl);
    images.push(imgUrl);
  });
  return images;
}

async function extractAlbum(id: number): Promise<string[]> {
  const images: string[] = []
  const albumUrl = getAlbumUrl(id);
  const $ = await openUrl(albumUrl);
  const pageEl = $('.tg_pages a').first();
  const pageLen = Number((pageEl.text().match(/\d+/) || [])[0]);
  await _.times(pageLen, async (i: number) => {
    images.concat(await extractImage(id, i + 1));
  });
  return images;
}

async function extractList(listUrl: string): Promise<Albums> {
  const albums: Albums = {};
  const $ = await openUrl(listUrl);
  const listEls = $('.pic-m >li >p >a');
  await listEls.each(async (i, listEl) => {
    const title = listEl.attribs.title || '';
    const href = listEl.attribs.href || '';
    const id = Number((href.match(/\d+(?=\.html$)/) || [])[0]) || 0;
    const images = id === 0 ? [] : await extractAlbum(id);
    const album: Album = {
      id,
      title,
      images: [],
    }
    albums[id] = album;
  })
  return albums;
}

async function extractRoot(): Promise<Albums[]> {
  const albumList: Albums[] = [];
  const $ = await openUrl(baseUrl);
  const listEl = $('.pagelist >select');
  await listEl.children().each(async (i, el) => {
    const listUrl = getListUrl(el.attribs.value);
    const albums = await extractList(listUrl);
    albumList.push(albums);
  });
  return albumList;
}

async function gongkou(): Promise<void> {
  const albums = await extractRoot();
  return;
}

console.log('gongkou');
gongkou();
