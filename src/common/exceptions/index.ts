export type { ApiErrorResponse } from './dto/api-error-response.dto';
export { ApiErrorResponseDto } from './dto/api-error-response.dto';
export { BadRequestException } from './lib/bad-request.exception';
export { BaseException } from './lib/base.exception';
export { ConflictException } from './lib/conflict.exception';
export { HttpExceptionFilter } from './lib/http-exception.filter';
export { InternalServerErrorException } from './lib/internal-server-error.exception';
export { mapPrismaClientKnownRequestToHttpException } from './lib/prisma-known-request.mapper';
export { NotFoundException } from './lib/not-found.exception';
