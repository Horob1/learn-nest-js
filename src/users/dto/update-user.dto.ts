import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { GENDERS, ROLES } from 'src/constants/enums';

class Company {
  _id: mongoose.Types.ObjectId;

  name: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company?: Company;

  @IsOptional()
  @IsEnum(GENDERS)
  gender?: string;

  @IsOptional()
  @IsEnum(ROLES)
  role?: string;
}
