import { Body, Param, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthRoles } from 'src/common/decorators/auth-roles.decorator';
import { NullDataResponseDto } from 'src/common/dto/response.dto';
import { CommonController } from 'src/common/utils/common.controller';
import { Endpoint, Resource } from 'ts-deco';
import { UserAdminUpdateDto } from '../dto/user.admin.update.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserFindManyDto } from '../dto/user.find.dto';
import { UserFindAdminUniqueResponseDto } from '../dto/response/user.find-admin-unique.response.dto';
import { AdminUserFindManyResponseDto } from '../dto/response/user.find-list.response.dto';
import { UserConstant as CONSTANT } from '../user.constant';
import { UserService } from '../user.service';

@Resource('mgmt/admin')
export class UserMgmtController extends CommonController {
    constructor(private readonly service: UserService) {
        super(CONSTANT.ADMIN_NAME);
    }

    @Endpoint({
        method: 'POST',
        summary: `${CONSTANT.ADMIN_NAME} 생성`,
        description: `${CONSTANT.ADMIN_NAME} 생성`,
        isAuth: true,
        body: { type: UserCreateDto, required: true },
    })
    @AuthRoles(Role.ADMIN)
    async create(@Body() body: UserCreateDto): Promise<NullDataResponseDto> {
        await this.service.create(body);
        return this.responseData(`${CONSTANT.ADMIN_NAME} 생성`, null);
    }

    @Endpoint({
        method: 'GET',
        summary: `${CONSTANT.ADMIN_NAME} 목록 조회`,
        description: `${CONSTANT.ADMIN_NAME} 목록 조회`,
        isAuth: true,
    })
    @AuthRoles(Role.ADMIN)
    async findMany(@Query() query: UserFindManyDto): Promise<AdminUserFindManyResponseDto> {
        const { items, total } = await this.service.findMany(query);
        const totalPages = Math.ceil(total / query.take);
        return this.responseData('유저 목록 조회', items, {
            totalCount: total,
            page: query.page,
            limit: query.take,
            totalPages,
        });
    }

    @Endpoint({
        method: 'GET',
        endpoint: ':id',
        summary: `${CONSTANT.ADMIN_NAME} 단건 조회`,
        description: `${CONSTANT.ADMIN_NAME} 상세 조회 (계정 정보 포함)`,
        isAuth: true,
    })
    @AuthRoles(Role.ADMIN)
    async findOne(@Param('id') id: string): Promise<UserFindAdminUniqueResponseDto> {
        const user = await this.service.findUniqueWithAccountById(Number(id));
        return this.responseData(`${CONSTANT.ADMIN_NAME} 조회`, user);
    }

    @Endpoint({
        method: 'PUT',
        endpoint: ':id',
        summary: `${CONSTANT.ADMIN_NAME} 수정`,
        description: `${CONSTANT.ADMIN_NAME} 수정 (role 포함)`,
        isAuth: true,
        body: { type: UserAdminUpdateDto, required: true },
    })
    @AuthRoles(Role.ADMIN)
    async update(@Param('id') id: string, @Body() body: UserAdminUpdateDto): Promise<NullDataResponseDto> {
        await this.service.updateByAdmin(Number(id), body);
        return this.responseData(`${CONSTANT.ADMIN_NAME} 수정`, null);
    }

    @Endpoint({
        method: 'DELETE',
        endpoint: ':id',
        summary: `${CONSTANT.ADMIN_NAME} 삭제`,
        description: `${CONSTANT.ADMIN_NAME} 소프트 삭제`,
        isAuth: true,
    })
    @AuthRoles(Role.ADMIN)
    async delete(@Param('id') id: string): Promise<NullDataResponseDto> {
        await this.service.delete(Number(id));
        return this.responseData(`${CONSTANT.ADMIN_NAME} 삭제`, null);
    }
}
