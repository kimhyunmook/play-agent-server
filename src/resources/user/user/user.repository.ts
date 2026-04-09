import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { UserWithAccountPayload } from './user.types';

@Injectable()
export class UserRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    private get repository(): Prisma.UserDelegate {
        return this.txHost.tx.user;
    }

    create(data: Prisma.UserCreateInput) {
        return this.repository.create({ data });
    }

    findUniqueByLoginId(loginId: string): Promise<UserWithAccountPayload | null> {
        return this.repository.findFirst({
            where: { userAccount: { loginId }, deletedAt: null },
            include: {
                userAccount: { select: { password: true, loginId: true } },
            },
        });
    }

    findUniqueById<T extends Prisma.UserFindUniqueArgs>(args: Prisma.SelectSubset<T, Prisma.UserFindUniqueArgs>) {
        return this.repository.findUnique(args);
    }

    findUniqueWithAccountStatusById(id: number) {
        return this.repository.findUnique({
            where: { id },
            select: {
                id: true,
                role: true,
                deletedAt: true,
                userAccount: {
                    select: {
                        status: true,
                    },
                },
            },
        });
    }

    update(id: number, data: Prisma.UserUpdateInput) {
        return this.repository.update({ where: { id }, data });
    }

    delete(id: number) {
        return this.repository.update({ where: { id }, data: { deletedAt: new Date() } });
    }

    async findMany(args: { skip: number; take: number; orderBy?: Prisma.UserOrderByWithRelationInput }) {
        const { skip, take, orderBy } = args;
        const [items, total] = await Promise.all([
            this.repository.findMany({
                where: { deletedAt: null },
                skip,
                take,
                orderBy: orderBy ?? { createdAt: 'desc' },
                omit: { deletedAt: true },
            }),
            this.repository.count({ where: { deletedAt: null } }),
        ]);
        return { items, total };
    }

    async findUniqueByIdWithAccount(id: number) {
        return this.repository.findUnique({
            where: { id, deletedAt: null },
            omit: { deletedAt: true },
            include: {
                userAccount: { select: { loginId: true, status: true } },
            },
        });
    }
}
