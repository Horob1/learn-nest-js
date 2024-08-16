import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { API_METHOD } from 'src/constants/enums';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  apiPath: string;

  @IsEnum(API_METHOD)
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsNotEmpty()
  module: string;
}
