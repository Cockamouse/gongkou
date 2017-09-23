import * as bluebird from 'bluebird';
import * as fs from 'fs';
import * as _ from 'lodash';
import { baseUrl, Album, Albums, openUrl } from './defines';

const getListUrl = (url: string) => `${baseUrl}/${url}`;
const getAlbumUrl = (id: number) => `${baseUrl}/${id}.html`;
const getPageUrl = (id: number, i?: number) => {
  if (i === undefined) return getAlbumUrl(id);
  return `${baseUrl}/${id}_${i}.html`
};

function downloadImage(imgUrl: string, localPath: string): void {
  //console.log(imgUrl);
}

function downloadAlbum(album: Album): void {
  console.dir(album, { depth: 20, maxArrayLength: 500 });
}

function extractImage(id: number, i: number, cb?: Function): void {
  const pageUrl = getPageUrl(id, i);
  openUrl(pageUrl).then($ => {
    const imgUrl = $('.tcontent img').attr('src');
    imgUrl && cb(imgUrl);
  });
}

function extractAlbum(id: number, title: string): void {
  const albumUrl = getAlbumUrl(id);
  openUrl(albumUrl).then($ => {
    const imgUrl = $('.tcontent img').attr('src');
    const album: Album = { id, title, images: [imgUrl] };
    const pageEl = $('.tg_pages a').first();
    const pageLen = Number((pageEl.text().match(/\d+/) || [])[0]);
    _.times(pageLen - 1, (i: number) => {
      extractImage(id, i + 2, (imgUrl: string) => {
        album.images[i + 1] = imgUrl;
        const validLen = album.images.filter(x => x).length;
        //console.log(`Trace:${id}:${validLen}:${i + 2}:\t${imgUrl}`)
        validLen >= pageLen && downloadAlbum(album);
      });
    });
  });
}

function extractList(listUrl: string): void {
  openUrl(listUrl).then($ => {
    const albums: Albums = {};
    const listEls = $('.pic-m >li >p >a');
    listEls.each((i, listEl) => {
      const title = listEl.attribs.title || '';
      const href = listEl.attribs.href || '';
      const id = Number((href.match(/\d+(?=\.html$)/) || [])[0]) || 0;
      id !== 0 && extractAlbum(id, title);
    });
  });
}

function extractRoot(): void {
  openUrl(baseUrl).then($ => {
    const listEl = $('.pagelist >select');
    listEl.children().each((i, el) => {
      const listUrl = getListUrl(el.attribs.value);
      extractList(listUrl);
    });
  })
}

function gongkou(): void {
  extractRoot();
}

console.log(process.argv.join(' '));
//extractAlbum(5433, '');
extractList(getListUrl(process.argv[2]));
//gongkou();
