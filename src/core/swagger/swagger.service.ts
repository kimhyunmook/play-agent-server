import { Injectable, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { AppConfigService } from '../config/app-config.service';
import { createMultiTokenScript, MultiTokenEnums } from './multitoken.factory';
import {
  buildTagGroupHighlightCss,
  buildTagPathHighlightScript,
  getTagGroupNames,
  getTagNames,
  getTagNamesSameAsGroup,
} from './utils/tag-group-css';
import {
  buildSwaggerDarkModeCssV2,
  buildSwaggerDarkModeScript,
} from './utils/swagger-dark-mode';

type SwaggerPathOperation = { tags?: string[] };
type SwaggerDoc = {
  tags?: Array<{ name: string; description?: string }>;
  paths?: Record<string, Record<string, SwaggerPathOperation>>;
};

@Injectable()
export class SwaggerService {
  constructor(private readonly env: AppConfigService) {}

  /** Multi Token용 Enum 구조 생성 (Prisma Role 기준) */
  private getMultiTokenEnums(): MultiTokenEnums {
    const role = $Enums.Role;
    return {
      ADMIN_ROLE: role.ADMIN ? { ADMIN: role.ADMIN } : undefined,
      USER_ROLE: role.USER ? { USER: role.USER } : undefined,
    };
  }

  /**
   * Swagger 태그 정렬: auth 관련 태그를 최상단 고정
   * - @ApiTags를 안 쓰는 경우에도 paths 기반으로 태그를 수집해 tags를 채움
   */
  private pinAuthTagsToTop(document: unknown): void {
    const doc = document as SwaggerDoc;

    const tagNames = getTagNames(doc);
    if (tagNames.length === 0) return;

    const isAuthTag = (name: string) => name.toLowerCase().includes('auth');

    const authTags: string[] = [];
    const restTags: string[] = [];
    for (const name of tagNames) {
      (isAuthTag(name) ? authTags : restTags).push(name);
    }

    const orderedNames = [...authTags, ...restTags];

    const existingByName = new Map<
      string,
      { name: string; description?: string }
    >();
    for (const t of doc.tags ?? []) existingByName.set(t.name, t);

    doc.tags = orderedNames.map((name) => existingByName.get(name) ?? { name });
  }

  /** mgmt 경로 기준으로 Swagger 문서 분리 */
  private buildFilteredDocument(
    document: unknown,
    includeMgmt: boolean,
  ): SwaggerDoc {
    const source = JSON.parse(JSON.stringify(document)) as SwaggerDoc;
    const paths = source.paths ?? {};

    source.paths = Object.fromEntries(
      Object.entries(paths).filter(([path]) => {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        const isMgmtPath = normalizedPath.startsWith('mgmt/');
        return includeMgmt ? isMgmtPath : !isMgmtPath;
      }),
    );

    const tagsInPaths = new Set<string>();
    for (const ops of Object.values(source.paths)) {
      for (const op of Object.values(ops ?? {})) {
        for (const tag of op.tags ?? []) {
          tagsInPaths.add(tag);
        }
      }
    }

    if ((source.tags ?? []).length > 0) {
      source.tags = (source.tags ?? []).filter((tag) =>
        tagsInPaths.has(tag.name),
      );
    } else if (tagsInPaths.size > 0) {
      source.tags = Array.from(tagsInPaths).map((name) => ({ name }));
    }

    this.pinAuthTagsToTop(source);
    return source;
  }

  /** Swagger UI 옵션 생성 및 문서별 커스텀 스크립트 등록 */
  private buildSwaggerUiOptions(
    adapter: {
      get?: (
        p: string,
        h: (
          req: unknown,
          res: {
            setHeader: (a: string, b: string) => void;
            send: (b: string) => void;
          },
        ) => void,
      ) => void;
    },
    docsPath: 'api-docs' | 'api-docs-mgmt',
    document: SwaggerDoc,
    multiTokenScript: string,
  ) {
    if (adapter.get) {
      adapter.get(`/${docsPath}/multitoken.js`, (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.send(multiTokenScript);
      });
      adapter.get(`/${docsPath}/swagger-dark-mode.js`, (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.send(buildSwaggerDarkModeScript());
      });
    }

    const tagGroupNames = getTagGroupNames(document);
    const tagNamesSameAsGroup = getTagNamesSameAsGroup(document, tagGroupNames);
    const customCss =
      `${buildTagGroupHighlightCss(tagNamesSameAsGroup)}${buildSwaggerDarkModeCssV2()}` +
      `.swagger-ui .scheme-container { display: none !important; }`;

    const customJsList = [
      `/${docsPath}/multitoken.js`,
      `/${docsPath}/swagger-dark-mode.js`,
    ];
    if (tagNamesSameAsGroup.length > 0) {
      const tagPathHighlightScript =
        buildTagPathHighlightScript(tagNamesSameAsGroup);
      if (adapter.get) {
        adapter.get(`/${docsPath}/tag-path-highlight.js`, (_req, res) => {
          res.setHeader('Content-Type', 'application/javascript');
          res.send(tagPathHighlightScript);
        });
      }
      customJsList.push(`/${docsPath}/tag-path-highlight.js`);
    }

    return {
      customCss,
      customJs: customJsList,
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        persistAuthorization: true,
      },
    };
  }

  /**
   * Swagger 문서 설정
   */
  setupSwagger(app: INestApplication): void {
    const multiTokenEnums = this.getMultiTokenEnums();
    const multiTokenScript = createMultiTokenScript(
      this.env.appName,
      multiTokenEnums,
    );

    const httpAdapter = app.getHttpAdapter();
    const adapter = httpAdapter as unknown as {
      get: (
        p: string,
        h: (
          req: unknown,
          res: {
            setHeader: (a: string, b: string) => void;
            send: (b: string) => void;
          },
        ) => void,
      ) => void;
    };

    const config = new DocumentBuilder()
      .setTitle(`${this.env.appName} API`)
      .setDescription(this.env.appDescription)
      .setVersion(this.env.appVersion)
      .addBearerAuth()
      .build();

    const baseDocument = SwaggerModule.createDocument(app, config);
    const publicDocument = this.buildFilteredDocument(baseDocument, false);
    const mgmtDocument = this.buildFilteredDocument(baseDocument, true);

    SwaggerModule.setup(
      'api-docs',
      app,
      publicDocument as unknown as Parameters<typeof SwaggerModule.setup>[2],
      this.buildSwaggerUiOptions(
        adapter,
        'api-docs',
        publicDocument,
        multiTokenScript,
      ),
    );

    SwaggerModule.setup(
      'api-docs-mgmt',
      app,
      mgmtDocument as unknown as Parameters<typeof SwaggerModule.setup>[2],
      this.buildSwaggerUiOptions(
        adapter,
        'api-docs-mgmt',
        mgmtDocument,
        multiTokenScript,
      ),
    );
  }

  /**
   * 애플리케이션 설정 초기화
   */
  setup(app: INestApplication): void {
    this.setupSwagger(app);
  }
}
