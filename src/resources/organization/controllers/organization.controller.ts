import { CommonController } from 'src/common/utils/common.controller';
import { Resource } from 'ts-deco';
import { ORGANIZATION_CONSTANTS } from '../organization.constants';
import { OrganizationService } from '../organization.service';

@Resource('organizations')
export class OrganizationController extends CommonController {
    constructor(private readonly service: OrganizationService) {
        super(ORGANIZATION_CONSTANTS.NAME);
    }
}
