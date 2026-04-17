import { CreateDtoFromModel } from 'src/common/helpers/create-from-model.dto';
import { AgentModel } from '../models/agent.model';

export class AgentCreateDto extends CreateDtoFromModel({
    model: AgentModel,
    pick: ['creatorId', 'name', 'description', 'task'],
    optional: [],
}) {}
