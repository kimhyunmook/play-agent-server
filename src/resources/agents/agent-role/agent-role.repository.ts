import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CommonRepository, PrismaTxHost } from 'src/common/utils/common.repository';

@Injectable()
export class AgentRoleRepository extends CommonRepository<'agentRole'> {
    protected readonly modelKey = 'agentRole';

    constructor(txHost: PrismaTxHost) {
        super(txHost);
    }

    create(data: Prisma.AgentRoleCreateInput) {
        return this.repository.create({ data });
    }
}
