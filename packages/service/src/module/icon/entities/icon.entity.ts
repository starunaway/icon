import { IsString, Matches } from 'class-validator';

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum IconLabel {
  Normal = 'normal',
  Color = 'color',
}

export const buildTags = (tags?: string[] | string): string => {
  if (Array.isArray(tags)) {
    return tags.join(',');
  }
  return tags || '';
};
export const buildReturnTags = (tags?: string): string[] => {
  return tags ? tags.split(',') : [];
};

@Entity('icon', { name: 'icon' })
@Unique(['name'])
@Unique(['fileHash'])
export class IconEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    comment: '主键',
  })
  id: string; // 标记为主键，值自动生成

  @Column({ length: 60, comment: 'icon名称' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_\-]+$/, { message: '只允许包含数字、大小写字母、下划线和中划线符号' })
  name: string; //

  @Column({
    type: 'text',
    nullable: true,
    comment: '描述',
  })
  desc: string; //

  @Column({
    length: 60,
    comment: '创建人',
  })
  creator: string;

  @Column({
    length: 60,
    comment: '更新人',
  })
  updater: string;

  @Column({
    length: 200,
    comment: '文件存储路径',
  })
  filePath: string;

  @Column({
    length: 200,
    comment: '处理后的文件存储路径',
    nullable: true,
  })
  optimizeFilePath: string;

  @Column({
    length: 200,
    comment: '文件存储哈希值',
  })
  fileHash: string;

  @Column({
    length: 60,
    nullable: true,
    comment: '类型标签',
  })
  label: IconLabel;

  @Column({
    type: 'text',
    nullable: true,
    comment: '自定义标签',
  })
  tag: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @BeforeInsert()
  @BeforeUpdate()
  transformArrays() {
    this.tag = buildTags(this.tag);
  }
}
