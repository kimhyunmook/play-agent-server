import { Global, Module } from '@nestjs/common';
import { SwaggerService } from './swagger.service';
@Global()
@Module({
  providers: [SwaggerService],
  exports: [SwaggerService],
})
export class SwaggerModule {}
