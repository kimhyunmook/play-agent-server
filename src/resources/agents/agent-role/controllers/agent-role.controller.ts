import { Body } from '@nestjs/common';
import { NullDataResponseDto } from 'src/common/dto/response.dto';
import { CommonController } from 'src/common/utils/common.controller';
import { Endpoint, Resource } from 'ts-deco';
import { AGENT_ROLE_CONSTANTS } from '../agent-role.constants';
import { AgentRoleCreateDto } from '../dto/agent-role.create.dto';
import { AgentRoleService } from '../agent-role.service';

@Resource('agent-roles')
export class AgentRoleController extends CommonController {
    constructor(private readonly service: AgentRoleService) {
        super(AGENT_ROLE_CONSTANTS.NAME);
    }

    @Endpoint({
        method: 'POST',
        summary: `${AGENT_ROLE_CONSTANTS.NAME} 생성`,
        description: `${AGENT_ROLE_CONSTANTS.NAME} 생성`,
        body: { type: AgentRoleCreateDto, required: true },
    })
    async create(@Body() body: AgentRoleCreateDto): Promise<NullDataResponseDto> {
        await this.service.create(body);
        return this.responseData(`${AGENT_ROLE_CONSTANTS.NAME} 생성`, null);
    }
}
