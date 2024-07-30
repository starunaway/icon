import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { ViteSvgIconsPlugin } from './types';
import * as glob from 'glob';
import type { Plugin } from 'vite';
export const SVG_ICON_CONTENT = 'virtual:svg-icon-content';
export const SVG_DOM_ID = '__svg__icons__dom__';
export const XMLNS = 'http://www.w3.org/2000/svg';
export const XMLNS_LINK = 'http://www.w3.org/1999/xlink';

const publicDir = path.resolve(process.cwd(), 'public');
const htmlPath = path.resolve(process.cwd(), 'index.html');
let assetsDir = path.join(publicDir, 'assets');
let lastFetchTime = Date.now();
let lastUpdateTime = '';
let minInterval = 5 * 60 * 1000; // 默认5分钟，可以在vite.config.js中配置

export default function svgContent(opt: ViteSvgIconsPlugin): Plugin {
  let { host } = opt;

  return {
    name: 'vite-plugin-svg',
    enforce: 'pre',
    configResolved() {
      minInterval = opt.minInterval || minInterval;
    },

    resolveId(id) {
      if (id === SVG_ICON_CONTENT) {
        return id;
      }
    },
    async load(id) {
      if (id === SVG_ICON_CONTENT) {
        if (process.env.BUILD_TAG) {
          return `export const lastUpdateTime = {}`;
        }

        try {
          const { filename } = (await createModuleCode(host)) || {}; // 如果没有获取过更新时间，发送请求获取
          if (filename) {
            let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
            // 移除旧的 <script src="/index-svg-*.js"></script> 标签
            htmlContent = htmlContent.replace(
              /<script src="\/assets\/index-svg-.*\.js"><\/script>/g,
              ''
            );
            const scriptTag = `<script src="/assets/${filename}"></script>`;
            fs.writeFileSync(htmlPath, htmlContent.replace('</body>', `${scriptTag}</body>`));
          }
        } catch (e) {
          console.error(e);
        } finally {
        }

        let match = fs
          .readFileSync(htmlPath, 'utf-8')
          .match(/<script src="\/index-svg-(.*)\.js"><\/script>/);
        let numberPart = match?.[1];

        return `export const lastUpdateTime = ${lastUpdateTime || numberPart};`;
      }
    },
  } as Plugin;
}

async function createModuleCode(host: string) {
  // 小于指定的时间间隔，不请求
  const now = Date.now();
  if (now - lastFetchTime < (minInterval || 0)) return;
  lastFetchTime = now;

  const response = await axios.get(host);

  const res = response.data.data;
  // 最近没有更新
  if (res.lastUpdateTime === lastUpdateTime) {
    return;
  }

  lastUpdateTime = res.lastUpdateTime;
  const content = res.content;

  const { insertHtml } = await compilerIcons(content);

  const xmlns = `xmlns="${XMLNS}"`;
  const xmlnsLink = `xmlns:xlink="${XMLNS_LINK}"`;
  const html = insertHtml
    .replace(new RegExp(xmlns, 'g'), '')
    .replace(new RegExp(xmlnsLink, 'g'), '');

  const code = `
    if (typeof window !== 'undefined') {
      function loadSvg() {
        var body = document.body;
        var svgDom = document.getElementById('${SVG_DOM_ID}');
        if(!svgDom) {
          svgDom = document.createElementNS('${XMLNS}', 'svg');
          svgDom.style.position = 'absolute';
          svgDom.style.width = '0';
          svgDom.style.height = '0';
          svgDom.id = '${SVG_DOM_ID}';
          svgDom.setAttribute('xmlns','${XMLNS}');
          svgDom.setAttribute('xmlns:link','${XMLNS_LINK}');
        }
        svgDom.innerHTML = ${JSON.stringify(html)};
        ${domInject('body-last')}
      }
      if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSvg);
      } else {
        loadSvg()
      }
   }
     `;
  // 写入文件
  const filename = `index-svg-${lastUpdateTime}.js`;
  // 检查 assets 目录是否存在
  if (!fs.existsSync(assetsDir)) {
    // 如果不存在，创建 assets 目录
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 删除旧的 index-svg-*.js 文件
  const oldFiles = glob.sync(path.join(publicDir, 'assets', 'index-svg-*.js'));
  oldFiles.forEach(fs.unlinkSync);

  fs.writeFileSync(path.join(publicDir, 'assets', `${filename}`), code);
  return { filename };
}

function domInject(inject: 'body-last' | 'body-first') {
  switch (inject) {
    case 'body-first':
      return 'body.insertBefore(svgDom, body.firstChild);';
    default:
      return 'body.insertBefore(svgDom, body.lastChild);';
  }
}

export async function compilerIcons(
  content: {
    name: string;
    svg: string;
    optimizeSvg: string;
  }[]
) {
  let insertHtml = '';

  for (const { optimizeSvg } of content) {
    // const symbolId = `icon-${name}`;
    // const svgSymbol = await compilerIcon(symbolId, svg, svgOptions);
    insertHtml += `${optimizeSvg || ''}`;
    // idSet.add(symbolId);
  }

  return { insertHtml };
}
