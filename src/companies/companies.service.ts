import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import {
  COMPANY_MESSAGE,
  MONGOOSE_MESSAGE,
} from 'src/constants/response.messages';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}
  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const createdCompany = await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });

    return {
      _id: createdCompany._id,
      createdAt: createdCompany.createdAt,
      logo: createdCompany.logo,
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let { sort }: { sort: any } = aqp(qs);
    sort = sort || '-createdAt';

    const defaultLimit = +limit ? +limit : 10;
    const offset = (+page - 1) * +defaultLimit;

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .populate(population)
      .exec();

    return {
      meta: {
        current: page, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const company = await this.companyModel.findById(id);
    if (!company)
      throw new BadRequestException(COMPANY_MESSAGE.COMPANY_NOT_FOUND);
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const updatedCompany = await this.companyModel.findByIdAndUpdate(
      id,
      {
        ...updateCompanyDto,
        updatedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
      },
      {
        returnDocument: 'after',
        lean: true,
      },
    );
    return {
      _id: updatedCompany._id,
      updatedAt: updatedCompany.updatedAt,
      logo: updatedCompany.logo,
    };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const deletedCompany = await this.companyModel.findOneAndUpdate(
      { _id: id },
      {
        deletedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
        deleted: true,
        deletedAt: new Date(),
      },
    );
    if (!deletedCompany)
      throw new BadRequestException(COMPANY_MESSAGE.COMPANY_NOT_FOUND);
    return {
      _id: deletedCompany._id,
      deletedAt: deletedCompany.deletedAt,
    };
  }
}
