import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AgentRoleCreateDto } from './dto/agent-role.create.dto';
import { AgentRoleRepository } from './agent-role.repository';
import { validator as createValidator } from './validators/agent-role.create.validators';

@Injectable()
export class AgentRoleService {
    constructor(private readonly repository: AgentRoleRepository) {}

    create(data: AgentRoleCreateDto) {
        const validator: Prisma.AgentRoleCreateArgs = createValidator(data);
        return this.repository.create(validator);
    }
}
