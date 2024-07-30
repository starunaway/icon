export interface ViteSvgIconsPlugin {
  minInterval?: number;

  /**
   * icon format
   * @default: body-last
   */
  inject?: 'body-last';

  /**
   * custom dom id
   * @default: __svg__icons__dom__
   */
  customDomId?: string;

  /**
   * 服务端接口地址
   */
  host: string;
}

export interface FileStats {
  relativeName: string;
  mtimeMs?: number;
  code: string;
  symbolId?: string;
}
