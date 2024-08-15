import { CloudinaryService } from './cloudinary.service';
import {
  Controller,
  Headers,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UPLOAD_FILE_MESSAGE } from 'src/constants/response.messages';
import { ResponseMessage } from 'src/decorators/customize';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  @Post('upload-image')
  @ResponseMessage(UPLOAD_FILE_MESSAGE.UPLOAD_SUCCESS)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|jpg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Headers('folder_type') folder: string,
  ) {
    return this.cloudinaryService.uploadFile(file, folder);
  }
  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  uploadPDF(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'application/pdf',
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Headers('folder_type') folder: string,
  ) {
    return this.cloudinaryService.uploadFile(file, folder);
  }
}
