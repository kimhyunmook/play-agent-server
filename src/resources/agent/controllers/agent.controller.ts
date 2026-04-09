import { CommonController } from 'src/common/utils/common.controller';
import { Resource } from 'ts-deco';
import { AGENT_CONSTANTS } from '../agent.constants';
import { AgentService } from '../agent.service';

@Resource('agents')
export class AgentController extends CommonController {
    constructor(private readonly service: AgentService) {
        super(AGENT_CONSTANTS.NAME);
    }
}
