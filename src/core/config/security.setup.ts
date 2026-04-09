import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

/**
 * Security 설정
 * - Helmet (보안 헤더)
 */
export function setupSecurity(app: NestExpressApplication, configService: ConfigService) {
    // Helmet 설정
    if (configService.get<string>('NODE_ENV') === 'production') {
        app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'"],
                        imgSrc: ["'self'", 'data:', 'https:'],
                    },
                },
                crossOriginEmbedderPolicy: false, // Swagger 호환성
            }),
        );
    }
    // CORS 설정
    const nodeEnv = configService.get<string>('NODE_ENV', 'development').toLowerCase();
    const isDev = ['local', 'develop', 'development'].includes(nodeEnv);

    if (isDev) {
        // development: 모든 origin 허용
        app.enableCors({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true,
            maxAge: 3600,
        });
    } else {
        // production: DOMAIN_URL에 등록된 origin만 허용
        const domainUrl = configService.get<string>('DOMAIN_URL');
        const envOrigins =
            domainUrl && domainUrl !== 'undefined'
                ? domainUrl
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean)
                : [];
        const allowedOrigins = envOrigins.length > 0 ? envOrigins : [];

        app.enableCors({
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (allowedOrigins.includes(origin)) return callback(null, true);
                callback(new Error('CORS policy: Not allowed origin'));
            },
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true,
            maxAge: 3600,
        });
    }

    // Trust proxy 설정
    app.set('trust proxy', true);
}
