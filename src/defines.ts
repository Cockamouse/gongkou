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

export function openUrl(url, depth = 0): Promise<CheerioStatic> {
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
