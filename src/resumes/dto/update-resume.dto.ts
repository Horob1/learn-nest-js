import { Optional } from '@nestjs/common';
import { IsEnum } from 'class-validator';

import { RESUME_STATUS } from 'src/constants/enums';

export class UpdateResumeDto {
  @Optional()
  @IsEnum(RESUME_STATUS)
  status: string;
}
