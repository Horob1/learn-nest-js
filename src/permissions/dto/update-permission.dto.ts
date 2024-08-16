import { IsEnum, IsOptional, IsString } from 'class-validator';
import { API_METHOD } from 'src/constants/enums';

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  apiPath: string;

  @IsEnum(API_METHOD)
  @IsOptional()
  method: string;

  @IsString()
  @IsOptional()
  module: string;
}
