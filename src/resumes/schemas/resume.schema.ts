import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, SchemaTypes } from 'mongoose';

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ _id: false, versionKey: false })
class ResumeHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ required: true, type: Object })
  updatedBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };
}

const ResumeHistorySchema = SchemaFactory.createForClass(ResumeHistory);

@Schema({ timestamps: true })
export class Resume {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  status: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    ref: 'Company',
  })
  company: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.String, ref: 'Job' })
  job: mongoose.Types.ObjectId;

  @Prop([{ type: ResumeHistorySchema }])
  history: ResumeHistory[];

  @Prop({ required: true, type: Object })
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

export const ResumeSchema = SchemaFactory.createForClass(Resume);
