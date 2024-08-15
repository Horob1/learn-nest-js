import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import { JOB_MESSAGE, MONGOOSE_MESSAGE } from 'src/constants/response.messages';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
  ) {}
  async create(createJobDto: CreateJobDto, user: IUser) {
    const newJob = await this.jobModel.create({
      ...createJobDto,
      company: {
        _id: new mongoose.Types.ObjectId(createJobDto.company._id),
        name: createJobDto.company.name,
      },
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });
    return { _id: newJob._id, createdAt: newJob.createdAt };
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

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const job = await this.jobModel.findById(id);
    console.log(job);
    if (!job) throw new BadRequestException(JOB_MESSAGE.JOB_NOT_FOUND);
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const updatedCompany: any = {};
    if (updateJobDto.company) {
      updatedCompany.company = {
        _id: new mongoose.Types.ObjectId(updateJobDto.company._id),
        name: updateJobDto.company.name,
      };
    }
    const updatedJob = await this.jobModel.findByIdAndUpdate(
      id,
      {
        updatedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
        ...updateJobDto,
        ...updatedCompany,
      },
      { returnDocument: 'after', lean: true },
    );
    if (!updatedJob) throw new BadRequestException(JOB_MESSAGE.JOB_NOT_FOUND);

    return {
      _id: updatedJob._id,
      updatedAt: updatedJob.updatedAt,
    };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);

    const deletedJob = await this.jobModel.findByIdAndUpdate(
      id,
      {
        deletedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
        deleted: true,
        deletedAt: new Date(),
      },
      { returnDocument: 'after', lean: true },
    );

    if (!deletedJob) throw new BadRequestException(JOB_MESSAGE.JOB_NOT_FOUND);

    return {
      _id: deletedJob._id,
      deletedAt: deletedJob.deletedAt,
    };
  }
}
