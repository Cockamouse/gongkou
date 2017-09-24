import * as fs from 'fs';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

export const baseUrl = 'http://www.gkba.cc/gongkou';

export interface Albums {
  [key: number]: Album;
}

export interface Album {
  id: number;
  title: string;
  images: string[];
}

export function openUrl(url: string, depth = 0): Promise<CheerioStatic> {
  return new Promise((resolve, reject) => {
    rp(url).then((html: string) => {
      const $ = cheerio.load(html);
      resolve($);
    }).catch((err) => {
      //console.log(`Error (depth:${depth}) in ${url}`);
      if (depth > 5) {
        resolve(cheerio.load('<html><body></body></html>'));
        return;
      }
      resolve(openUrl(url, depth + 1));
    });
  });
}

export function downloadImg(uri: string, localPath: string, depth = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    rp.get(uri)
      .on('error', (err) => {
        if (depth > 5) {
          resolve();
          return;
        }
        resolve(downloadImg(uri, localPath, depth + 1));
      })
      .pipe(fs.createWriteStream(localPath))
      .on('error', (err) => { console.log(err); });
  });
}
