import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxHost, CommonRepository } from 'src/common/utils/common.repository';

@Injectable()
export class AgentRepository extends CommonRepository<'agent'> {
    protected readonly modelKey = 'agent';

    constructor(txHost: PrismaTxHost) {
        super(txHost);
    }

    create<T extends Prisma.AgentCreateArgs>(
        args: Prisma.SelectSubset<T, Prisma.AgentCreateArgs>,
    ): Promise<Prisma.AgentGetPayload<T>> {
        return this.repository.create(args);
    }
}
