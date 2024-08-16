import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsMongoId({ each: true })
  permissions: string[];

  @IsString()
  @IsNotEmpty()
  module: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: string;
}
