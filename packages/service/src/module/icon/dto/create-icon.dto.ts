import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IconLabel } from '../entities/icon.entity';

export class CreateIconDto {
  @IsString()
  @IsNotEmpty({
    message: 'name 不能为空',
  })
  name: string;

  // todo 后续不能为空
  @IsString()
  @IsOptional()
  creator?: string;

  // todo 后续不能为空
  @IsString()
  @IsOptional()
  updater?: string;

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'color'])
  label?: IconLabel;

  @IsOptional()
  @IsArray()
  tag?: string[];
}
