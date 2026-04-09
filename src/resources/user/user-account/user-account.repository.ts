import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class UserAccountRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  private get repository(): Prisma.UserAccountDelegate {
    return this.txHost.tx.userAccount;
  }

  create(data: Prisma.UserAccountCreateInput) {
    return this.repository.create({ data });
  }

  fuByloginId(loginId: string) {
    return this.repository.findUnique({
      where: { loginId },
      select: { user: { select: { id: true } } },
    });
  }

  findByUserIdWithPassword(userId: number) {
    return this.repository.findUnique({
      where: { userId },
      select: {
        userId: true,
        password: true,
      },
    });
  }

  updatePasswordByUserId(userId: number, password: string) {
    return this.repository.update({
      where: { userId },
      data: { password },
    });
  }
}
