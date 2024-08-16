import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { SoftDeleteModel } from 'mongoose-delete';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;
    const roleDetails = await this.roleModel
      .findById(role)
      .populate({
        path: 'permissions',
        select: { _id: 1, name: 1, apiPath: 1, module: 1, method: 1 },
      })
      .lean();
    return {
      _id,
      name,
      email,
      role,
      permissions: roleDetails?.permissions ?? [],
    };
  }
}
