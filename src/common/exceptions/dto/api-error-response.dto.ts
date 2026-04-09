import { ApiProperty } from '@nestjs/swagger';

/** API 오류 응답 타입 (meta 제외, data 항상 null) */
export type ApiErrorResponse = {
    code: number;
    message: string;
    data: null;
};

/** Swagger 문서용 오류 응답 DTO */
export class ApiErrorResponseDto {
    @ApiProperty({ description: 'HTTP 상태 코드', example: 400 })
    code: number;

    @ApiProperty({ description: '오류 메시지', example: '잘못된 요청입니다' })
    message: string;

    @ApiProperty({ description: '데이터 (오류 시 null)', example: null, nullable: true })
    data = null;
}
