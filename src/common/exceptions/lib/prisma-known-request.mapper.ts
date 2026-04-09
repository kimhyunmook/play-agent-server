import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BadRequestException } from './bad-request.exception';
import { ConflictException } from './conflict.exception';
import { InternalServerErrorException } from './internal-server-error.exception';
import { NotFoundException } from './not-found.exception';
import { PRISMA_ERROR_DEFAULTS, PRISMA_ERROR_MAP } from './prisma-error-messages';

/**
 * Prisma `PrismaClientKnownRequestError` → Nest `HttpException`.
 * `@Transactional()` 등으로 확장(client `$extends`) 밖에서 실행된 쿼리에서도 동일한 API 응답 규칙을 쓰기 위해 사용합니다.
 */
export function mapPrismaClientKnownRequestToHttpException(e: Prisma.PrismaClientKnownRequestError): HttpException {
    const mapped = PRISMA_ERROR_MAP[e.code] ?? {
        ...PRISMA_ERROR_DEFAULTS.known,
        message: e.message,
    };

    const { message, type } = mapped;

    switch (type) {
        case 'Conflict':
            return new ConflictException(message);
        case 'NotFound':
            return new NotFoundException(message);
        case 'BadRequest':
            return new BadRequestException(message);
        case 'InternalServerError':
            return new InternalServerErrorException(message);
        default:
            return new BadRequestException(message);
    }
}
