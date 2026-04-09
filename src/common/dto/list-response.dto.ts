import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from './response.dto';
import { Type } from 'class-transformer';

export class MetaDto {
    @ApiProperty({ description: '전체 수', type: Number })
    totalCount: number;

    @ApiProperty({ description: '페이지', type: Number })
    page: number;

    @ApiProperty({ description: '한 페이지의 제한 수', type: Number })
    limit: number;

    @ApiProperty({ description: '총 페이지 수', type: Number })
    totalPages: number;
}

/** API 응답 공통 타입 (data nullable) */
export type ApiResponse<T = null> = {
    code: number;
    message: string;
    data: T | null;
    meta?: MetaDto;
};

/** API 응답 타입 (data 필수, data 제공 시 사용) */
export type ApiResponseWithData<T> = {
    code: number;
    message: string;
    data: T;
    meta?: MetaDto;
};

export class ListResponseDto extends ResponseDto {
    @ApiProperty({ description: '메타 데이터', type: MetaDto, nullable: true })
    @Type(() => MetaDto)
    meta?: MetaDto;
}
