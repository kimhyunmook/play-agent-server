import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto/response.dto';

export class LoginData {
    @ApiProperty({ description: 'access token', type: String })
    accessToken: string;
}

export class LoginResponseDto extends ResponseDto {
    @ApiProperty({ description: '로그인 응답 데이터', type: LoginData })
    data: LoginData;
}
