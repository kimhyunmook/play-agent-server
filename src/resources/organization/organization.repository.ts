import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxHost, CommonRepository } from 'src/common/utils/common.repository';

@Injectable()
export class OrganizationRepository extends CommonRepository<'organization'> {
    protected readonly modelKey = 'organization';

    constructor(txHost: PrismaTxHost) {
        super(txHost);
    }

    create(data: Prisma.OrganizationCreateInput) {
        return this.repository.create({ data });
    }
}
