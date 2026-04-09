import { Module } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './controllers/organization.controller';

@Module({
    imports: [],
    controllers: [OrganizationController],
    providers: [OrganizationService, OrganizationRepository],
    exports: [OrganizationService],
})
export class OrganizationModule {}
