import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
    @ApiProperty({ description: '상태 코드', type: Number, example: 200 })
    code: number;

    @ApiProperty({ description: '메시지', type: String, example: '반환 메세지' })
    message: string;
}

class IdNumber {
    id: number;
}
export class NumberIdResponseDto extends ResponseDto {
    data: IdNumber;
}

export class NullDataResponseDto extends ResponseDto {
    @ApiProperty({ description: '반환 데이터', example: null, nullable: true })
    data: unknown = null;
}
