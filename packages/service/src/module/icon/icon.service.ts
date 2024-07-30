import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IconEntity, IconLabel } from './entities/icon.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { ApiException ,ApiErrorCode} from 'src/common';




@Injectable()
export class IconService {
  constructor(
    @InjectRepository(IconEntity)
    private iconRepository: Repository<IconEntity>,
    @Inject('IconLogger') private readonly logger: Logger
  ) {}

  async create(body: Partial<IconEntity>) {
    try {
      return await this.iconRepository.save(body);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof QueryFailedError) {
        // 如果是QueryFailedError，那么可能是因为违反了唯一约束
        throw new ApiException(
          'name 重复',
          ApiErrorCode.DuplicateException,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else {
        // 如果是其他类型的错误，重新抛出
        throw new ApiException(
          error.message,
          ApiErrorCode.DuplicateException,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async update(body: Partial<IconEntity>) {
    const { id, ...updateFields } = body;

    try {
      // 更新数据
      await this.iconRepository.update(id, updateFields);
      // 返回更新后的数据
      const updatedIcon = await this.iconRepository.findOneBy({
        id,
      });

      if (!updatedIcon) {
        throw new ApiException(
          'Icon not found',
          ApiErrorCode.IconSaveError,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return updatedIcon;
    } catch (error) {
      throw new ApiException(
        error.message,
        ApiErrorCode.IconSaveError,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    this.logger.log('findAll scm');
    return await this.iconRepository.find();
  }

  async find(query: { name?: string; label?: IconLabel; tag?: string[] }) {
    const { name, label, tag } = query;
    this.logger.log('findicon', query);

    const queryBuilder = this.iconRepository.createQueryBuilder('icon');

    if (name) {
      queryBuilder.andWhere('icon.name LIKE :name', { name: `%${name}%` });
    }

    if (label) {
      queryBuilder.andWhere('icon.label = :label', { label });
    }

    if (tag) {
      tag.forEach((t) => {
        queryBuilder.andWhere('icon.tag LIKE :tag', { tag: `%${t}%` });
      });
    }

    const result = await queryBuilder.getMany();

    return result;
  }

  async findOne(query: { id?: string; fileHash?: string; name?: string }) {
    const { id, fileHash, name } = query;
    this.logger.log('findOne', query);

    return await this.iconRepository.findOneBy({
      id,
      fileHash,
      name,
    });
  }

  async listContent(lastUpdateTime?: number) {
    const [latestIcon] = await this.iconRepository.find({
      order: {
        updateTime: 'DESC',
      },
      take: 1,
    });

    const latestUpdateTime = latestIcon ? latestIcon.updateTime.getTime() : 0;

    if (lastUpdateTime && latestUpdateTime === lastUpdateTime) {
      return { lastUpdateTime };
    }

    const icons = await this.iconRepository.find({
      order: {
        updateTime: 'DESC',
      },
    });

    return {
      lastUpdateTime: latestUpdateTime,
      icons,
    };
  }

  async delete(query: { id: string }) {
    const { id } = query;
    return await this.iconRepository.delete(id);
  }
}
