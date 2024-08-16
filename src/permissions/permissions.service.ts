import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import {
  MONGOOSE_MESSAGE,
  PERMISSION_MESSAGE,
} from 'src/constants/response.messages';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const createdPermission = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });
    return {
      _id: createdPermission._id,
      createdAt: createdPermission.createdAt,
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

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel
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
    const permission = await this.permissionModel.findById(id);
    if (!permission)
      throw new BadRequestException(PERMISSION_MESSAGE.PERMISSION_NOT_FOUND);
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const updatedPermission = await this.permissionModel.findByIdAndUpdate(id, {
      ...updatePermissionDto,
      updatedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });
    if (!updatedPermission)
      throw new BadRequestException(PERMISSION_MESSAGE.PERMISSION_NOT_FOUND);
    return {
      _id: updatedPermission._id,
      updatedAt: updatedPermission.updatedAt,
    };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const deletedPermission = await this.permissionModel.findByIdAndUpdate(id, {
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
      deletedAt: new Date(),
      deleted: true,
    });
    if (!deletedPermission)
      throw new BadRequestException(PERMISSION_MESSAGE.PERMISSION_NOT_FOUND);
    return {
      _id: deletedPermission._id,
      deletedAt: deletedPermission.updatedAt,
    };
  }
}
