import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UPLOAD_FILE_MESSAGE } from 'src/constants/response.messages';
import { ResponseMessage } from 'src/decorators/customize';

@Controller('files')
export class FilesController {
  @Post('upload')
  @ResponseMessage(UPLOAD_FILE_MESSAGE.UPLOAD_SUCCESS)
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|jpg|png|webp)|application\/pdf$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return file.filename;
  }
}
