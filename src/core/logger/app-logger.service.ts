import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * 커스텀 로거 서비스
 * Winston 기반 날짜별 로그 파일 저장
 * 프로덕션 환경에서 로그를 파일로 저장하고 관리
 */
@Injectable()
export class AppLoggerService implements LoggerService {
    // 숨기고 싶은 로그 패턴들
    private readonly HIDDEN_LOG_PATTERNS = ['InstanceLoader', 'RoutesResolver', 'RouterExplorer', 'NestFactory'];

    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    /**
     * 로그를 숨길지 판단
     */
    private shouldHideLog(message: string, context?: string | object): boolean {
        const contextStr = this.formatContext(context);
        const fullMessage = `${contextStr} ${message}`;
        return this.HIDDEN_LOG_PATTERNS.some(pattern => fullMessage.includes(pattern));
    }

    /**
     * context를 읽기 쉬운 문자열로 변환
     */
    private formatContext(context?: string | object): string {
        if (context == null) return '';
        if (typeof context === 'string') return context;
        if (typeof context === 'object') {
            try {
                const entries = Object.entries(context)
                    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
                    .join(', ');
                return entries || JSON.stringify(context);
            } catch {
                return '[object]';
            }
        }
        return String(context);
    }

    /**
     * 메시지 포맷팅
     */
    private formatMessage(message: string, context?: string | object): string {
        const contextStr = this.formatContext(context);
        return contextStr ? `[${contextStr}] ${message}` : String(message);
    }

    log(message: string, context?: string | object) {
        if (this.shouldHideLog(message, context)) return;
        this.logger.info(this.formatMessage(message, context));
    }

    error(message: string, trace?: string, context?: string | object) {
        if (this.shouldHideLog(message, context)) return;
        this.logger.error(this.formatMessage(message, context), {
            trace,
            context,
        });
    }

    warn(message: string, context?: string | object) {
        if (this.shouldHideLog(message, context)) return;
        this.logger.warn(this.formatMessage(message, context));
    }

    debug(message: string, context?: string | object) {
        if (this.shouldHideLog(message, context)) return;
        this.logger.debug(this.formatMessage(message, context));
    }

    verbose(message: string, context?: string | object) {
        if (this.shouldHideLog(message, context)) return;
        this.logger.verbose(this.formatMessage(message, context));
    }

    /**
     * 특정 패턴 추가
     */
    addHiddenPattern(pattern: string) {
        this.HIDDEN_LOG_PATTERNS.push(pattern);
    }

    /**
     * 특정 패턴 제거
     */
    removeHiddenPattern(pattern: string) {
        const index = this.HIDDEN_LOG_PATTERNS.indexOf(pattern);
        if (index > -1) {
            this.HIDDEN_LOG_PATTERNS.splice(index, 1);
        }
    }

    /**
     * 커스텀 로그 메서드들
     */

    /**
     * HTTP 요청 로그
     */
    logRequest(method: string, url: string, statusCode: number, ip: string) {
        this.logger.info('HTTP Request', {
            method,
            url,
            statusCode,
            ip,
            type: 'http',
        });
    }

    /**
     * 데이터베이스 쿼리 로그 (프로덕션에서는 출력 안 함)
     */
    logQuery(query: string, duration: number) {
        const env = process.env.NODE_ENV?.toLowerCase() ?? '';
        if (env.includes('prod')) return;
        this.logger.debug('Database Query', {
            query,
            duration,
            type: 'database',
        });
    }

    /**
     * 비즈니스 로직 로그
     */
    logBusiness(action: string, data?: any) {
        this.logger.info('Business Logic', {
            action,
            data,
            type: 'business',
        });
    }

    /**
     * 보안 관련 로그
     */
    logSecurity(event: string, details?: any) {
        this.logger.warn('Security Event', {
            event,
            details,
            type: 'security',
        });
    }
}
