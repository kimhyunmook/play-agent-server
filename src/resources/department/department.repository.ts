import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxHost, CommonRepository } from '../../common/utils/common.repository';

@Injectable()
export class DepartmentRepository extends CommonRepository<'department'> {
    protected readonly modelKey = 'department';

    constructor(txHost: PrismaTxHost) {
        super(txHost);
    }

    create(data: Prisma.DepartmentCreateInput) {
        return this.repository.create({ data });
    }
}
