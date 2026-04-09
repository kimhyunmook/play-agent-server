import { CreateDtoFromModel } from 'src/common/helpers/create-from-model.dto';
import { DepartmentModel } from '../models/department.model';

export class DepartmentCreateDto extends CreateDtoFromModel({
    model: DepartmentModel,
    pick: ['name', 'description', 'organizationId'],
    optional: [],
}) {}
