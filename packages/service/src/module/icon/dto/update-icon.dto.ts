import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateIconDto } from './create-icon.dto';

export class UpdateIconDto extends CreateIconDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  tag?: string[];
}
