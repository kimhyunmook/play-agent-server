import { Injectable } from '@nestjs/common';
import { AgentRoleRepository } from './agent-role.repository';

@Injectable()
export class AgentRoleService {
    constructor(private readonly repository: AgentRoleRepository) {}
}
