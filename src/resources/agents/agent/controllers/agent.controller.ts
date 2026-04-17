import { Body } from '@nestjs/common';
import { NullDataResponseDto } from 'src/common/dto/response.dto';
import { CommonController } from 'src/common/utils/common.controller';
import { Endpoint, Resource } from 'ts-deco';
import { AGENT_CONSTANTS } from '../agent.constants';
import { AgentCreateDto } from '../dto/agent.create.dto';
import { AgentService } from '../agent.service';

@Resource('agents')
export class AgentController extends CommonController {
    constructor(private readonly service: AgentService) {
        super(AGENT_CONSTANTS.NAME);
    }

    @Endpoint({
        method: 'POST',
        summary: `${AGENT_CONSTANTS.NAME} 생성`,
        description: `${AGENT_CONSTANTS.NAME} 생성`,
        body: { type: AgentCreateDto, required: true },
    })
    async create(@Body() body: AgentCreateDto): Promise<NullDataResponseDto> {
        await this.service.create(body);
        return this.responseData(`${AGENT_CONSTANTS.NAME} 생성`, null);
    }
}
