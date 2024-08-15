import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { JOB_LEVEL } from 'src/constants/enums';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  skills: string[];

  @Prop({ type: Object })
  company: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };

  @Prop({ required: true })
  location: string;

  @Prop()
  salary: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: String, enum: JOB_LEVEL })
  @IsEnum(JOB_LEVEL)
  level: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  isActive: boolean;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
