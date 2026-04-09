import { Body } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthRoles } from 'src/common/decorators/auth-roles.decorator';
import { Account } from 'src/common/decorators/user.decorator';
import { NullDataResponseDto } from 'src/common/dto/response.dto';
import { AccountJwt } from 'src/common/interface/accout.interface';
import { CommonController } from 'src/common/utils/common.controller';
import { Endpoint, Resource } from 'ts-deco';
import { UserFindMeResponseDto } from '../dto/response/user.find-me.response.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { UserChangePasswordDto } from '../dto/user.change-password.dto';
import { UserConstant as CONSTANT } from '../user.constant';
import { UserService } from '../user.service';

@Resource('users')
export class UserController extends CommonController {
  constructor(private readonly service: UserService) {
    super(CONSTANT.NAME);
  }

  @Endpoint({
    method: 'GET',
    endpoint: 'me',
    summary: '내 정보 조회',
    description: '내 정보 조회 (캐싱해서 사용 권장)',
    isAuth: true,
  })
  @AuthRoles(Role.USER, Role.ADMIN)
  async me(@Account() account: AccountJwt): Promise<UserFindMeResponseDto> {
    const user =
      await this.service.findUniqueIncludeUserAccountByAccount(account);
    return this.responseData('내 정보 조회', user);
  }

  @Endpoint({
    method: 'PUT',
    endpoint: 'me',
    summary: '내 정보 수정',
    description: '내 정보 수정',
    isAuth: true,
  })
  @AuthRoles(Role.ADMIN, Role.USER)
  async updateMe(
    @Account() account: AccountJwt,
    @Body() body: UserUpdateDto,
  ): Promise<NullDataResponseDto> {
    await this.service.update(account.sub, body);
    return this.responseData('유저 정보 수정', null);
  }

  @Endpoint({
    method: 'DELETE',
    endpoint: 'me',
    summary: '회원 탈퇴',
    description: '탈퇴 처리',
    isAuth: true,
  })
  @AuthRoles(Role.ADMIN, Role.USER)
  async delete(@Account() account: AccountJwt): Promise<NullDataResponseDto> {
    await this.service.delete(account.sub);
    return this.responseData('회원 탈퇴', null);
  }

  @Endpoint({
    method: 'PATCH',
    endpoint: 'me/password',
    summary: '내 비밀번호 변경',
    description: '현재 비밀번호 확인 후 비밀번호 변경',
    isAuth: true,
  })
  @AuthRoles(Role.ADMIN, Role.USER)
  async changePasswordMe(
    @Account() account: AccountJwt,
    @Body() body: UserChangePasswordDto,
  ): Promise<NullDataResponseDto> {
    await this.service.changePassword(
      account.sub,
      body.currentPassword,
      body.newPassword,
    );
    return this.responseData('비밀번호 변경', null);
  }
}
