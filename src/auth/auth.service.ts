import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/register-user.dto';
import { ENV } from 'src/constants/env';
import { ITokenPayload } from './token.interface';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import { Request, Response } from 'express';
import { AUTH_MESSAGE } from 'src/constants/response.messages';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private refreshModel: Model<RefreshToken>,
  ) {}
  private async signRefreshToken(
    userInfo: IUser,
    exp?: number,
  ): Promise<string> {
    const payload: any = {
      ...userInfo,
      sub: 'token refresh',
      iss: 'from server',
    };
    const options: JwtSignOptions = {
      secret: this.configService.get<string>(ENV.REFRESH_TOKEN_SECRET),
    };
    //nếu không truyền exp thì options thên thời hạn
    if (!exp)
      options.expiresIn = this.configService.get<string>(
        ENV.REFRESH_TOKEN_EXPIRED,
      );
    //nếu có exp thì dùng exp được truyền vào
    else options.expiresIn = exp;

    return this.jwtService.sign(payload, options);
  }
  private verifyRefreshToken(token: string): Promise<ITokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(ENV.REFRESH_TOKEN_SECRET),
    });
  }
  private async signAccessToken(userInfo: IUser): Promise<string> {
    const payload = { ...userInfo, sub: 'token login', iss: 'from server' };
    return this.jwtService.sign(payload);
  }
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (user && this.usersService.verifyPassword(pass, user.password)) {
      delete user.password;
      return user;
    }
    return null;
  }
  async login(user: IUser, res: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      _id,
      name,
      email,
      role,
    };
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);
    //decode refresh token and save to db
    const verifiedRTPayload = await this.verifyRefreshToken(refresh_token);
    await this.refreshModel.findOneAndUpdate(
      { userId: user._id },
      {
        token: refresh_token,
        userId: new mongoose.Types.ObjectId(user._id),
        iat: new Date(verifiedRTPayload.iat * 1000),
        exp: new Date(verifiedRTPayload.exp * 1000),
      },
      { upsert: true },
    );

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      expires: new Date(verifiedRTPayload.exp * 1000), // 30 days
    });

    return {
      access_token: access_token,
      user: { _id, name, email, role },
    };
  }
  register(registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  async refresh(req: Request, res: Response) {
    const oldRefreshToken = req.cookies['refresh_token'];

    //check refresh token exists (remember refresh token will be removed after expired in db)
    const existToken = await this.refreshModel.findOne({
      token: oldRefreshToken,
    });
    if (!existToken)
      throw new UnauthorizedException(AUTH_MESSAGE.INVALID_TOKEN);

    //get user info
    const user = await this.usersService.findOne(existToken.userId.toString());
    const { _id, name, email, role } = user;
    const payload: IUser = {
      _id: _id.toString(),
      name: name,
      email: email,
      role: role,
    };

    //sign new access token and refresh token

    //convert exp to second
    const expiresIn =
      Math.floor(new Date(existToken.exp).getTime() / 1000) -
      Math.floor(Date.now() / 1000);

    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload, expiresIn),
    ]);

    //update db with new refresh token
    await this.refreshModel.findOneAndUpdate(
      { token: oldRefreshToken },
      {
        token: refresh_token,
        $currentDate: {
          iat: true,
        },
      },
    );

    res.cookie('refresh_token', refresh_token, {
      expires: new Date(existToken.exp),
      httpOnly: true,
      secure: true,
    });

    return {
      access_token: access_token,
      user: { _id, name, email, role },
    };
  }
}
