import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class UpdateCompanyDto {
  @Optional()
  @IsString()
  name: string;

  @IsString()
  @Optional()
  address: string;

  @IsString()
  @Optional()
  description: string;

  @IsString()
  @Optional()
  logo: string;
}
