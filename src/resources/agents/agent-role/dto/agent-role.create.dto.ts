import { CreateDtoFromModel } from 'src/common/helpers/create-from-model.dto';
import { AgentRoleModel } from '../models/agent-role.model';

export class AgentRoleCreateDto extends CreateDtoFromModel({
    model: AgentRoleModel,
    pick: ['name', 'description'],
    optional: ['ownerId'],
}) {}
