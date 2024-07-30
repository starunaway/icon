import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Logger,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Query,
  Delete,
} from '@nestjs/common';
import { IconService } from './icon.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateIconDto } from './dto/create-icon.dto';
import * as fs from 'fs-extra';
import * as path from 'path';

import { ApiErrorCode } from 'src/common/enums/api-error-code.enum';
import { IconEntity, IconLabel, buildReturnTags, buildTags } from './entities/icon.entity';
import { UpdateIconDto } from './dto/update-icon.dto';
import * as crypto from 'crypto'; // 导入crypto模块
import * as Compiler from 'svg-baker';
import { optimize } from 'svgo';
import type { OptimizedSvg } from 'svgo';
import { ApiException, ResFieldTransformInterceptor } from 'src/common';

const SVGCompiler = new Compiler();

@Controller('icon')
@UseInterceptors(ResFieldTransformInterceptor('tag', buildReturnTags))
@UseInterceptors(ResFieldTransformInterceptor('fileHash', () => undefined))
export class IconController {
  constructor(
    private readonly iconService: IconService,
    @Inject('IconLogger')
    private readonly logger: Logger
  ) {}

  private async compilerIcon(name: string, svg: string | Buffer, isNormal: boolean) {
    const { data } = (await optimize(svg, {})) as OptimizedSvg;
    let content = data;

    // fix cannot change svg color  by  parent node problem
    if (isNormal) {
      content = content.replace(/stroke="[a-zA-Z#0-9]*"/g, 'stroke="currentColor"');
      content = content.replace(/fill="[^"]*"/g, 'fill="currentColor"');
    }

    const svgSymbol = await SVGCompiler.addSymbol({
      id: name,
      content,
      path: name,
    });
    return svgSymbol.render();
  }

  /**
   * 保存文件，如果文件 md5 已存在，则直接返回已有的文件
   * 需要保存两份，一份是原始文件，一份是经过处理后的文件
   */
  private async saveFile(
    file: {
      buffer: Buffer;
      originalname: string;
    },
    name: string,
    isNormal?: boolean
  ): Promise<{
    filePath: string;
    fileHash: string;
    optimizeFilePath: string;
  }> {
    try {
      // 需要计算处理后的文件
      const svgSymbol = await this.compilerIcon(`icon-${name}`, file.buffer, isNormal);
      const hash = crypto
        .createHash('md5')
        .update(`${name}&&${isNormal}&&${svgSymbol}`)
        .digest('hex');

      // const finded = await this.iconService.findOne({ fileHash: hash } as Parameters<
      //   typeof this.iconService.findOne
      // >[0]);

      // if (finded) {
      //   return {
      //     filePath: finded.filePath,
      //     optimizeFilePath: finded.optimizeFilePath,
      //     fileHash: hash,
      //   };
      // } else {
      const fileDir = `${process.env.ICON_DIR}/${process.env.ICON_SVG_DIR}`;
      const filePath = `${fileDir}/${hash}_${isNormal}_${file.originalname}`;
      // 确保目录存在
      fs.ensureDirSync(fileDir);
      // 写入文件
      fs.writeFileSync(filePath, file.buffer);

      const optimizeFilePath = `${fileDir}/${hash}_opt_${isNormal}_${file.originalname}`;
      fs.writeFileSync(optimizeFilePath, svgSymbol);

      return {
        fileHash: hash,
        optimizeFilePath: `${process.env.ICON_SVG_DIR}/${hash}_opt_${isNormal}_${file.originalname}`,
        filePath: `${process.env.ICON_SVG_DIR}/${hash}_${isNormal}_${file.originalname}`,
      };
      // }
    } catch (error) {
      throw new ApiException(
        error.message,
        ApiErrorCode.IconSaveError,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image',
        })
        .build({
          fileIsRequired: true,
        })
    )
    file: Express.Multer.File,
    @Body() body: CreateIconDto
  ) {
    this.logger.log('createScmDto', body);

    const saveRes = await this.saveFile(
      file,
      body.name,
      (body.label || IconLabel.Normal) === IconLabel.Normal
    );

    return this.iconService.create({
      ...body,
      tag: buildTags(body.tag),
      label: body.label || IconLabel.Normal,
      creator: body.creator || '',
      updater: body.updater || body.creator || '',
      ...saveRes,
    });
  }

  @Post('/update')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image',
        })
        .build({
          fileIsRequired: false,
        })
    )
    file: Express.Multer.File,
    @Body() body: UpdateIconDto
  ) {
    this.logger.log('UpdateIconDto', body);

    let saveRes: null | Record<string, string> = null;

    const icon = await this.iconService.findOne({ id: body.id });

    if (file) {
      saveRes = await this.saveFile(
        file,
        body.name,
        (body.label || IconLabel.Normal) === IconLabel.Normal
      );
    } else if (body.name !== icon.name || body.label !== icon.label) {
      // name 变化或 label，需要重新生成处理后的 icon 文件
      const existingFile = {
        originalname: `${body.name}.svg`,
        buffer: fs.readFileSync(path.resolve(process.env.ICON_DIR, icon.filePath)),
      };

      saveRes = await this.saveFile(
        existingFile,
        body.name,
        (body.label || IconLabel.Normal) === IconLabel.Normal
      );
    }

    const updateBody: Partial<IconEntity> = {
      ...body,
      label: body.label || IconLabel.Normal,
      creator: body.creator || '',
      updater: body.updater || body.creator || '',
    } as any;

    if (body.tag) {
      updateBody.tag = buildTags(body.tag);
    }

    if (file || body.name !== icon.name || body.label !== icon.label) {
      updateBody.filePath = saveRes.filePath;
      updateBody.fileHash = saveRes.fileHash;
      updateBody.optimizeFilePath = saveRes.optimizeFilePath;
    }

    const res = await this.iconService.update(updateBody);

    if (saveRes && saveRes?.filePath !== icon.filePath) {
      fs.unlinkSync(path.resolve(process.env.ICON_DIR, icon.filePath));
    }

    if (saveRes && saveRes?.optimizeFilePath !== icon.optimizeFilePath) {
      fs.unlinkSync(path.resolve(process.env.ICON_DIR, icon.optimizeFilePath));
    }

    return res;
  }

  @Get('/list')
  // 需要是 /api/icon/list?tag=a&tag=b，tag 才是数组
  find(@Query() query: { name?: string; label?: IconLabel; tag?: string[] | string }) {
    this.logger.log('get icon list', query);

    const { name, label, tag } = query;
    if (!name && !label && !tag) {
      return this.iconService.findAll();
    }

    if (typeof tag === 'string') {
      query.tag = [tag];
    }

    return this.iconService.find(query as Parameters<typeof this.iconService.find>[0]);
  }

  /**
   * 获取图标内容。
   * @param query
   * @returns
   */
  @Get('/listContent')
  async listContent(
    @Query()
    query: {
      lastUpdateTime?: string;
      type: 'all' | 'source' | 'optimize';
    }
  ) {
    this.logger.log('listContent', query);
    const { lastUpdateTime, icons } = await this.iconService.listContent(+query?.lastUpdateTime);

    let content = [];
    if (icons) {
      const { type = 'optimize' } = query;

      content = await Promise.all(
        icons.map(async (icon) => {
          let svg: string | undefined;
          let optimizeSvg: string | undefined;
          if (type === 'all' || type === 'source') {
            svg = await fs.readFile(path.resolve(process.env.ICON_DIR, icon.filePath), 'utf-8');
          }
          if ((type === 'all' || type === 'optimize') && icon.optimizeFilePath) {
            optimizeSvg = await fs.readFile(
              path.resolve(process.env.ICON_DIR, icon.optimizeFilePath),
              'utf-8'
            );
          }
          const item: Record<string, string | string[]> = {
            name: icon.name,
            label: icon.label,
          };
          if (svg) {
            item.svg = svg;
          }
          if (optimizeSvg) {
            item.optimizeSvg = optimizeSvg;
            item.tag = buildReturnTags(icon.tag);
          }
          return item;
        })
      );
    }

    return {
      lastUpdateTime: lastUpdateTime,
      content,
    };
  }

  @Get('/detail')
  async getIconDetail(@Query() query: { name: string }) {
    this.logger.log('getIconDetail', query);

    const { name } = query;
    const icon = await this.iconService.findOne({ name });
    const svg = await fs.readFile(path.resolve(process.env.ICON_DIR, icon.filePath), 'utf-8');
    const optimizeSvg = await fs.readFile(
      path.resolve(process.env.ICON_DIR, icon.optimizeFilePath),
      'utf-8'
    );

    const returnBody = {
      ...icon,
      svg,
      optimizeSvg,
    };

    delete returnBody.filePath;
    delete returnBody.fileHash;
    delete returnBody.optimizeFilePath;

    return returnBody;
  }

  @Delete('/delete')
  async delete(@Query() query: { id: string }) {
    this.logger.log('delete', query);
    const { id } = query;
    const icon = await this.iconService.findOne({ id });
    fs.unlinkSync(path.resolve(process.env.ICON_DIR, icon.filePath));
    fs.unlinkSync(path.resolve(process.env.ICON_DIR, icon.optimizeFilePath));

    return this.iconService.delete({ id });
  }
}
