import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AccountJwt } from 'src/common/interface/accout.interface';
import { CommonService } from 'src/common/utils/common.service';
import { UserAccountRepository } from '../user-account/user-account.repository';
import { UserAdminUpdateDto } from './dto/user.admin.update.dto';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { UserNotFoundException } from './exceptions/user.404.exception';
import { UserUnauthorizedPasswordException } from './exceptions/user.401.exception';
import { UserLoginIdConflictException } from './exceptions/user.409.exception';
import { UserRepository } from './user.repository';
import type { UserWithAccount } from './user.types';
import { AppConfigService } from 'src/core/config/app-config.service';
import { UserFindManyDto } from './dto/user.find.dto';
import { UserConstant } from './user.constant';
import { Role } from '@prisma/client';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class UserService extends CommonService {
    constructor(
        private readonly repository: UserRepository,
        private readonly userAccountRepository: UserAccountRepository,
        private readonly env: AppConfigService,
    ) {
        super();
    }

    @Transactional()
    async create(data: UserCreateDto) {
        const { loginId, password, ...userData } = data;
        const existing = await this.userAccountRepository.fuByloginId(loginId);
        if (existing) throw new UserLoginIdConflictException();

        const user = await this.repository.create({ ...userData });

        const userAccount = await this.userAccountRepository.create({
            loginId,
            password,
            user: { connect: { id: user.id } },
        });

        return { user, userAccount };
    }

    async findUniqueAndThrowById(id: number, role?: Role) {
        const user = await this.repository.findUniqueById({
            where: { id, deletedAt: null, role: role ?? Role.USER },
            omit: { deletedAt: true },
        });
        if (!user) throw new UserNotFoundException();
        return user;
    }

    async findAdminAndThrow() {
        const admin = await this.repository.findUniqueByLoginId(this.env.initAdmin);
        if (!admin) throw new UserNotFoundException();
        return admin;
    }

    async findUniqueByLoginId(loginId: string): Promise<UserWithAccount> {
        const user = await this.repository.findUniqueByLoginId(loginId);
        if (!user || !user.userAccount) throw new UserNotFoundException();
        return user as UserWithAccount;
    }

    async findUniqueIncludeUserAccountByAccount(account: AccountJwt) {
        const { sub: id } = account;
        const user = await this.repository.findUniqueById({
            where: { id, deletedAt: null },
            omit: { deletedAt: true },
            include: {
                userAccount: true,
            },
        });
        if (!user) throw new UserNotFoundException();
        return user;
    }

    async findUniqueWithAccountStatusById(id: number) {
        return this.repository.findUniqueWithAccountStatusById(id);
    }

    async update(id: number, data: UserUpdateDto) {
        await this.findUniqueAndThrowById(id);
        await this.repository.update(id, data);
    }

    async updateByAdmin(id: number, data: UserAdminUpdateDto) {
        await this.findUniqueAndThrowById(id);
        await this.repository.update(id, data);
    }

    async findMany(args: UserFindManyDto) {
        const orderBy = (() => {
            switch (args.sort) {
                case UserConstant.FIND_MANY_SORT.CREATED_AT_ASC:
                    return { createdAt: 'asc' as const };
                case UserConstant.FIND_MANY_SORT.CREATED_AT_DESC:
                    return { createdAt: 'desc' as const };
                default:
                    return { createdAt: 'desc' as const };
            }
        })();
        return this.repository.findMany({
            skip: (args.page - 1) * args.take,
            take: args.take,
            orderBy,
        });
    }

    async findUniqueWithAccountById(id: number) {
        const user = await this.repository.findUniqueByIdWithAccount(id);
        if (!user) throw new UserNotFoundException();
        return user;
    }

    async delete(id: number) {
        await this.findUniqueAndThrowById(id);
        await this.repository.delete(id);
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
        const account = await this.userAccountRepository.findByUserIdWithPassword(userId);
        if (!account) throw new UserNotFoundException();

        const isMatch = await bcrypt.compare(currentPassword, account.password);
        if (!isMatch) throw new UserUnauthorizedPasswordException();

        const hashed = await bcrypt.hash(newPassword, this.env.saltRounds);
        await this.userAccountRepository.updatePasswordByUserId(userId, hashed);
    }
}
