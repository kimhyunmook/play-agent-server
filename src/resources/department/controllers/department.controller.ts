import { CommonController } from 'src/common/utils/common.controller';
import { Resource } from 'ts-deco';
import { DEPARTMENT_CONSTANTS } from '../department.constants';
import { DepartmentService } from '../department.service';

@Resource('departments')
export class DepartmentController extends CommonController {
    constructor(private readonly service: DepartmentService) {
        super(DEPARTMENT_CONSTANTS.NAME);
    }
}
