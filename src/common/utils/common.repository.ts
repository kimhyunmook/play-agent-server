import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalClient, TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type PrismaTxClient = PrismaTransactionalClient<PrismaClient>;

@Injectable()
export class PrismaTxHost extends TransactionHost<TransactionalAdapterPrisma> {}

export abstract class CommonRepository<K extends keyof PrismaTxClient> {
    protected abstract readonly modelKey: K;

    constructor(protected readonly txHost: PrismaTxHost) {}

    protected get repository(): PrismaTxClient[K] {
        return this.txHost.tx[this.modelKey];
    }
}
