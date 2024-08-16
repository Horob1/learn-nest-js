import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissions: string[];

  @IsString()
  @IsOptional()
  module: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
