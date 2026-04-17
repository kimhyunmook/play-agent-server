import { Module } from '@nestjs/common';
import { AgentRoleRepository } from './agent-role.repository';
import { AgentRoleService } from './agent-role.service';
import { AgentRoleController } from './controllers/agent-role.controller';

@Module({
    imports: [],
    controllers: [AgentRoleController],
    providers: [AgentRoleService, AgentRoleRepository],
    exports: [AgentRoleService],
})
export class AgentRoleModule {}
