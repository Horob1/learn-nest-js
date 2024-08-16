import { IsEnum, IsOptional } from 'class-validator';

import { RESUME_STATUS } from 'src/constants/enums';

export class UpdateResumeDto {
  @IsOptional()
  @IsEnum(RESUME_STATUS)
  status: string;
}
