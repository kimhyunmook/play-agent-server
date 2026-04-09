import { CreateDtoFromModel } from 'src/common/helpers/create-from-model.dto';
import { OrganizationModel } from '../models/organization.model';

export class OrganizationCreateDto extends CreateDtoFromModel({
    model: OrganizationModel,
    pick: ['name', 'description'],
    optional: [],
}) {}
