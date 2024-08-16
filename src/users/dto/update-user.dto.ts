import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GENDERS } from 'src/constants/enums';

class Company {
  @IsMongoId()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  age: number;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsOptional()
  @IsEnum(GENDERS)
  gender: string;

  @IsOptional()
  @IsMongoId()
  role: string;
}
