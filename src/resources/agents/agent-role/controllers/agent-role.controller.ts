import { CommonController } from 'src/common/utils/common.controller';
import { Resource } from 'ts-deco';
import { AGENT_ROLE_CONSTANTS } from '../agent-role.constants';
import { AgentRoleService } from '../agent-role.service';

@Resource('agent-roles')
export class AgentRoleController extends CommonController {
    constructor(private readonly service: AgentRoleService) {
        super(AGENT_ROLE_CONSTANTS.NAME);
    }
}
