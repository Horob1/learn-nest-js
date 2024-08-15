import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { mkdir } from 'node:fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { basename as bn, extname } from 'node:path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  getRootPath = () => {
    return process.cwd();
  };
  ensureExists(targetDirectory: string) {
    mkdir(targetDirectory, { recursive: true }, (error) => {
      if (!error) {
        console.log('Directory successfully created, or it already exists.');
        return;
      }
      switch (error.code) {
        case 'EEXIST':
          // Error:
          // Requested location already exists, but it's not a directory.
          break;
        case 'ENOTDIR':
          // Error:
          // The parent hierarchy contains a file with the same name as the dir
          // you're trying to create.
          break;
        default:
          // Some other error like permission denied.
          console.error(error);
          break;
      }
    });
  }
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = req?.headers?.folder_type ?? 'default';
          this.ensureExists(`public/images/${folder}`);
          cb(null, join(this.getRootPath(), `public/images/${folder}`));
        },
        filename: (req, file, cb) => {
          //get image extension
          const extName = extname(file.originalname);
          //get image's name (without extension)
          const basename = bn(file.originalname, extName);
          const finalName = `${basename}-${Date.now()}${extName}`;
          cb(null, finalName);
        },
      }),
    };
  }
}
