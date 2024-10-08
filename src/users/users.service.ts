import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'mongoose-delete';
import mongoose, { Promise } from 'mongoose';
import aqp from 'api-query-params';
import { IUser } from './users.interface';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  MONGOOSE_MESSAGE,
  PERMISSION_MESSAGE,
  USERS_MESSAGE,
} from 'src/constants/response.messages';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { ADMIN_ROLE, USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  hashPassword(password: string): string {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  verifyPassword(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }
  async create(createUserDto: CreateUserDto, user: IUser) {
    const existedUser = await this.userModel.find({
      $or: [
        {
          email: createUserDto.email,
        },
        {
          username: createUserDto.username,
        },
      ],
    });
    if (existedUser) {
      throw new BadRequestException(USERS_MESSAGE.USERNAME_OR_EMAIL_EXISTED);
    }
    const hashedPassword = this.hashPassword(createUserDto.password);
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      role: new mongoose.Types.ObjectId(createUserDto.role),
      bio: '',
      avatar: '',
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });

    return { _id: newUser._id, createdAt: newUser.createdAt };
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

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
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
    const user = await this.userModel
      .findById(id, {
        password: false,
      })
      .populate({ path: 'role', select: { _id: 1, name: 1 } });
    if (!user) throw new BadRequestException(USERS_MESSAGE.USER_NOT_FOUND);
    return user;
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      {
        updatedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
        ...updateUserDto,
      },
      { returnDocument: 'after', lean: true },
    );

    if (!updatedUser)
      throw new BadRequestException(USERS_MESSAGE.USER_NOT_FOUND);

    delete updatedUser.password;

    return {
      _id: updatedUser._id,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(MONGOOSE_MESSAGE.INVALID_ID);
    const deletedUser = await this.userModel.findById(id).populate({
      path: 'role',
      select: {
        name: 1,
      },
    });
    if (!deletedUser)
      throw new BadRequestException(USERS_MESSAGE.USER_NOT_FOUND);
    if ((deletedUser.role as any).name === ADMIN_ROLE)
      throw new BadRequestException(PERMISSION_MESSAGE.PERMISSION_DENY);
    const date = new Date();
    await this.userModel.findByIdAndUpdate(id, {
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
      deleted: true,
      deletedAt: date,
    });
    return {
      _id: deletedUser._id,
      deletedAt: date,
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const hashedPassword = this.hashPassword(registerUserDto.password);
    const existedUser = await this.userModel.findOne({
      $or: [
        {
          email: registerUserDto.email,
        },
        {
          username: registerUserDto.username,
        },
      ],
    });

    if (existedUser) {
      throw new BadRequestException(USERS_MESSAGE.USERNAME_OR_EMAIL_EXISTED);
    }

    const role = await this.roleModel.findOne({ name: USER_ROLE });

    if (!role) {
      throw new InternalServerErrorException(
        MONGOOSE_MESSAGE.CANNOT_FIND_ROLE_USER,
      );
    }

    const newUser = await this.userModel.create({
      ...registerUserDto,
      password: hashedPassword,
      bio: '',
      avatar: '',
      role: role._id,
    });

    return { _id: newUser._id, createdAt: newUser.createdAt };
  }
}
