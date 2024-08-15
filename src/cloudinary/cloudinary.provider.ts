// cloudinary.provider.ts

import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { ENV } from 'src/constants/env';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>(ENV.CLOUDINARY_NAME),
      api_key: configService.get<string>(ENV.CLOUDINARY_API_KEY),
      api_secret: configService.get<string>(ENV.CLOUDINARY_API_SECRET),
    });
  },
  inject: [ConfigService],
};
