import { Module } from '@nestjs/common';
import { AgentRepository } from './agent.repository';
import { AgentService } from './agent.service';
import { AgentController } from './controllers/agent.controller';

@Module({
    imports: [],
    controllers: [AgentController],
    providers: [AgentService, AgentRepository],
    exports: [AgentService],
})
export class AgentModule {}
