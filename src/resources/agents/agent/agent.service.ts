import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AgentCreateDto } from './dto/agent.create.dto';
import { AgentRepository } from './agent.repository';
import { validator as createValidator } from './validators/agent.create.validators';

@Injectable()
export class AgentService {
    constructor(private readonly repository: AgentRepository) {}

    create(data: AgentCreateDto) {
        const validator: Prisma.AgentCreateArgs = createValidator(data);
        return this.repository.create(validator);
    }
}
