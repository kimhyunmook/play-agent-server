import { CommonController } from 'src/common/utils/common.controller';
import { S3Service } from './s3.service';

export class S3Controller extends CommonController {
    constructor(private readonly service: S3Service) {
        super('S3');
    }
}
