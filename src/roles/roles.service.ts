import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import {
  MONGOOSE_MESSAGE,
  PERMISSION_MESSAGE,
  ROLE_MESSAGE,
} from 'src/constants/response.messages';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const createdRole = await this.roleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
      permissions: createRoleDto.permissions.map(
        (id: string) => new mongoose.Types.ObjectId(id),
      ),
    });
    return { _id: createdRole._id, createdAt: createdRole.createdAt };
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

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
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

    const role = (await this.roleModel.findById(id)).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    });
    if (!role) throw new BadRequestException(ROLE_MESSAGE.ROLE_NOT_FOUND);

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const updatedRole = await this.roleModel.findByIdAndUpdate(id, {
      ...updateRoleDto,
      updatedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });
    if (!updatedRole)
      throw new BadRequestException(ROLE_MESSAGE.ROLE_NOT_FOUND);
    return { _id: updatedRole._id, updatedAt: updatedRole.updatedAt };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.isValidObjectId(id))
      throw new BadGatewayException(MONGOOSE_MESSAGE.INVALID_ID);
    const deletedRole = await this.roleModel.findById(id);
    if (!deletedRole)
      throw new BadRequestException(ROLE_MESSAGE.ROLE_NOT_FOUND);
    if (deletedRole.name === ADMIN_ROLE)
      throw new ForbiddenException(PERMISSION_MESSAGE.PERMISSION_DENY);
    const date = new Date();
    await this.roleModel.findByIdAndUpdate(id, {
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
      deleted: true,
      deletedAt: date,
    });

    return { _id: deletedRole._id, deletedAt: date };
  }
}
