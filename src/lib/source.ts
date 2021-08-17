import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2Remark, { Options } from 'rehype-remark';
import rehypeSanitize from 'rehype-sanitize';
// import { Handle } from 'hast-util-to-mdast';
import stringify from 'remark-stringify';
import { Transformer } from 'unified';
import { Node, Element } from 'hast';
// import visit from 'unist-util-visit';
import splitParagraph from 'rehype-split-paragraph';
import {
  PagesSourcePageMarkdown,
  PagesSourcePageHtml
} from '../types/client/contentTypes';
import { codeDockHandler } from './codedock';
var toText = require('hast-util-to-text');

const fenceToFrontMatterRegExp = /^---\n(.+)\n---\n*$/s;
export function firstParagraphAsCodeDockTransformer(): Transformer {
  return function transformer(tree: Node): void {
    const elm = tree as Element;
    if (tree.type === 'root' && Array.isArray(elm.children)) {
      const idx = elm.children.findIndex(
        (c) => c.type === 'element' && c.tagName === 'p'
      );
      if (idx >= 0) {
        const text = toText(elm.children[idx]);
        // console.log(text);
        const m = text.match(fenceToFrontMatterRegExp);
        if (m) {
          const cElm = elm.children[idx] as Element;
          cElm.tagName = 'pre';
          cElm.children = [
            {
              type: 'element',
              tagName: 'code',
              children: [
                {
                  type: 'text',
                  // value: text
                  // ---\nfoo:bar\n--- だと qrcode 変換でつかっている
                  // mdast-util-from-markdown で heading として扱われる。
                  // この辺がうまくいかない場合、mdast-util-frontmattera も検討
                  value: `===md\n---\n\n${m[1]}\n\n---\n`
                }
              ]
            }
          ];
        }
      }
    }
  };
}

const brHandler = (h: any, node: any): any => {
  // <br> が `/` になってしまうので暫定対応
  return h(node, 'text', ' ');
};

const htmlToMarkdownProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(firstParagraphAsCodeDockTransformer)
  .use(splitParagraph)
  .use(rehypeSanitize, { allowComments: true })
  .use(rehype2Remark, ({
    handlers: { pre: codeDockHandler, br: brHandler }
  } as unknown) as Options)
  .use(stringify)
  .freeze();

export function pageMarkdownMarkdown(
  markdown: PagesSourcePageMarkdown
): string {
  if (
    markdown.markdown &&
    markdown.markdown[markdown.markdown.length - 1] === '\n'
  ) {
    return `${markdown.markdown}`;
  }
  return `${markdown.markdown}\n`;
}
export async function pageHtmlMarkdown(
  html: PagesSourcePageHtml
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (html.html) {
      htmlToMarkdownProcessor.process(html.html, function (err, file) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          // とりあえず暫定で改ページさせる
          const markdown = `${file}`.replace(/\\---/g, '---');
          // console.log(markdown);
          if (markdown && markdown[markdown.length - 1] === '\n') {
            resolve(markdown);
            return;
          }
          resolve(`${markdown}\n`);
        }
      });
    }
    resolve('');
  });
}

export async function htmlToMarkdown(html: string): Promise<string> {
  const md = await pageHtmlMarkdown({
    fieldId: 'sourceHtml',
    html
  });
  // console.log(md);
  // return md;
  // console.log(await qrcodeToDataUrl(md));
  // return await qrcodeToDataUrl(md);
  return md;
}
