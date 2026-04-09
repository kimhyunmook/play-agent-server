import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  InternalServerErrorException,
  mapPrismaClientKnownRequestToHttpException,
} from 'src/common/exceptions';
import {
  PRISMA_ERROR_DEFAULTS,
  PRISMA_ERROR_MAP,
} from 'src/common/exceptions/lib/prisma-error-messages';
import { AppLoggerService } from '../logger/app-logger.service';

export const createErrorMappingExtension = (logger: AppLoggerService) =>
  Prisma.defineExtension({
    name: 'error-mapping-extension',
    query: {
      $allModels: {
        $allOperations: async ({ model, operation, args, query }) => {
          const startTime = Date.now();

          try {
            const result = await query(args);
            const duration = Date.now() - startTime;

            // 쿼리 로깅 (느린 쿼리만 - 100ms 이상)
            if (duration > 100) {
              logger.logQuery(`${model}.${operation}`, duration);
            }

            return result;
          } catch (e: unknown) {
            const duration = Date.now() - startTime;

            // Prisma 에러로 좁히기
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
              // 에러 로깅
              logger.error(
                `[Prisma ${e.code}] ${model}.${operation} failed`,
                JSON.stringify({ code: e.code, meta: e.meta, duration }),
                'PrismaError',
              );

              if (!PRISMA_ERROR_MAP[e.code]) {
                logger.warn(
                  `처리되지 않은 Prisma 에러 코드: ${e.code}`,
                  'PrismaError',
                );
              }
              throw mapPrismaClientKnownRequestToHttpException(e);
            } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
              logger.error(
                `알 수 없는 Prisma 에러: ${model}.${operation}`,
                e.message,
                'PrismaError',
              );
              throw new InternalServerErrorException(
                PRISMA_ERROR_DEFAULTS.unknown.message,
              );
            } else if (e instanceof Prisma.PrismaClientValidationError) {
              logger.error(
                `Prisma 검증 오류: ${model}.${operation}`,
                e.message,
                'PrismaValidation',
              );
              throw new BadRequestException(
                PRISMA_ERROR_DEFAULTS.validation.message,
              );
            } else {
              logger.error(
                `일반 예외: ${model}.${operation}`,
                e instanceof Error ? e.stack || e.message : String(e),
                'DatabaseError',
              );
              throw new InternalServerErrorException(
                e instanceof Error
                  ? e.message
                  : PRISMA_ERROR_DEFAULTS.unknown.message,
              );
            }
          }
        },
      },
    },
  });
