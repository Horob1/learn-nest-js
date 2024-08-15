import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { Optional } from '@nestjs/common';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Company } from 'src/users/dto/create-user.dto';
import { JOB_LEVEL } from 'src/constants/enums';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsString()
  @Optional()
  name: string;

  @Optional()
  @IsArray()
  @IsString({ each: true }) // "each" tells class-validator to run the validation on each item of the array
  @ArrayMinSize(1)
  skills: string[];

  @Optional()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsString()
  @Optional()
  location: string;

  @IsNumber()
  @Optional()
  salary: number;

  @IsNumber()
  @Optional()
  quantity: number;

  @Optional()
  @IsEnum(JOB_LEVEL)
  level: string;

  @IsString()
  @Optional()
  description: string;

  @Optional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @Optional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @Optional()
  @IsBoolean()
  isActive: boolean;
}
