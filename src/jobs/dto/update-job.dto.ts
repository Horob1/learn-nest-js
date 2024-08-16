import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Company } from 'src/users/dto/create-user.dto';
import { JOB_LEVEL } from 'src/constants/enums';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // "each" tells class-validator to run the validation on each item of the array
  @ArrayMinSize(1)
  skills: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsString()
  @IsOptional()
  location: string;

  @IsNumber()
  @IsOptional()
  salary: number;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsOptional()
  @IsEnum(JOB_LEVEL)
  level: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
