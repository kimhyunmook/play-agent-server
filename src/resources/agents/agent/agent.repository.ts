import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxHost, CommonRepository } from 'src/common/utils/common.repository';

@Injectable()
export class AgentRepository extends CommonRepository<'agent'> {
    protected readonly modelKey = 'agent';

    constructor(txHost: PrismaTxHost) {
        super(txHost);
    }

    create(data: Prisma.AgentCreateInput) {
        return this.repository.create({ data });
    }
}
