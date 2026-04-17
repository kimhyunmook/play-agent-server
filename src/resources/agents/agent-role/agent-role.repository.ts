import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxHost, CommonRepository } from 'src/common/utils/common.repository';

@Injectable()
export class AgentRoleRepository extends CommonRepository<'agentRole'> {
    protected readonly modelKey = 'agentRole';

    constructor(txHost: PrismaTxHost) {
        super(txHost);
    }

    create<T extends Prisma.AgentRoleCreateArgs>(
        args: Prisma.SelectSubset<T, Prisma.AgentRoleCreateArgs>,
    ): Promise<Prisma.AgentRoleGetPayload<T>> {
        return this.repository.create(args);
    }
}
