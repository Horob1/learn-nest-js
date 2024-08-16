import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import mongoose from 'mongoose';
import { RESUME_STATUS } from 'src/constants/enums';
import {
  MONGOOSE_MESSAGE,
  RESUME_MESSAGE,
} from 'src/constants/response.messages';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}
  async create(createResumeDto: CreateResumeDto, user: IUser) {
    const createdResume = await this.resumeModel.create({
      ...createResumeDto,
      email: user.email,
      user: new mongoose.Types.ObjectId(user._id),
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
      company: new mongoose.Types.ObjectId(createResumeDto.company),
      job: new mongoose.Types.ObjectId(createResumeDto.job),
      history: [
        {
          status: RESUME_STATUS.PENDING,
          updatedAt: new Date(),
          updatedBy: {
            _id: new mongoose.Types.ObjectId(user._id),
            email: user.email,
          },
        },
      ],
    });
    return {
      _id: createdResume._id,
      createdAt: createdResume.createdAt,
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let {
      sort,
      projection,
    }: { sort: any; projection: { [key: string]: number } } = aqp(qs);
    sort = sort || '-createdAt';
    projection = projection || { password: 0 };

    const defaultLimit = +limit ? +limit : 10;
    const offset = (+page - 1) * +defaultLimit;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        current: page || 1, //trang hiện tại
        pageSize: limit || defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const resume = await this.resumeModel
      .findById(id)
      .populate('user', '-password')
      .populate(['job', 'company']);
    if (!resume) throw new BadRequestException(RESUME_MESSAGE.RESUME_NOT_FOUND);
    return resume;
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);

    const resume = await this.resumeModel.findById(id);

    if (!resume) throw new BadRequestException(RESUME_MESSAGE.RESUME_NOT_FOUND);

    const date = new Date();
    resume.updatedBy = {
      _id: new mongoose.Types.ObjectId(user._id),
      email: user.email,
    };
    if (resume.status !== updateResumeDto.status) {
      resume.status = updateResumeDto.status;
      resume.history.push({
        status: updateResumeDto.status,
        updatedAt: date,
        updatedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
      });
    }
    resume.updatedAt = date;

    await resume.save();

    return {
      _id: resume._id,
      updatedAt: date,
    };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);

    const deletedResume = await this.resumeModel.findByIdAndUpdate(id, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });

    if (!deletedResume)
      throw new BadRequestException(RESUME_MESSAGE.RESUME_NOT_FOUND);

    return {
      _id: deletedResume._id,
      deletedAt: deletedResume.deletedAt,
    };
  }

  async getMyResume(user: IUser) {
    const resumes = await this.resumeModel
      .find({ user: user._id })
      .sort('-createdAt')
      .populate([
        {
          path: 'companyId',
          select: { name: 1 },
        },
        {
          path: 'jobId',
          select: { name: 1 },
        },
      ]);
    return resumes;
  }
}
