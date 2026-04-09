import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
    constructor(private readonly repository: OrganizationRepository) {}
}
