import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { RESUME_STATUS } from 'src/constants/enums';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  @IsEnum(RESUME_STATUS)
  status: string;

  @IsNotEmpty()
  @IsMongoId()
  company: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  job: mongoose.Types.ObjectId;
}
