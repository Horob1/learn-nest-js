import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { AUTH_MESSAGE, USERS_MESSAGE } from 'src/constants/response.messages';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { Request as RequestExpress, Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage(AUTH_MESSAGE.LOGIN_SUCCESS)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @Post('register')
  @Public()
  @ResponseMessage(AUTH_MESSAGE.REGISTER_SUCCESS)
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Get('refresh')
  @Public()
  @ResponseMessage(AUTH_MESSAGE.REFRESH_TOKEN_SUCCESS)
  refresh(
    @Req() req: RequestExpress,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @Get('account')
  @ResponseMessage(AUTH_MESSAGE.GET_ACCOUNT_SUCCESS)
  account(@User() user: IUser) {
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Post('logout')
  @ResponseMessage(AUTH_MESSAGE.LOGOUT_SUCCESS)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return 'ok';
  }
}
