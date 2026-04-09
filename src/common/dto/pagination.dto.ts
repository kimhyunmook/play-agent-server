import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationDto {
    @ApiProperty({ description: '페이지', type: Number, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number;

    @ApiProperty({
        description: '페이지 게시물 수',
        type: Number,
        default: 10,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    take: number;
}
