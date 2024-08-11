import { IUser } from 'src/users/users.interface';

export interface ITokenPayload extends IUser {
  iat: number;
  exp: number;
  sub: string;
  iss: string;
}
