import { Module } from '@nestjs/common';
import { DepartmentRepository } from './department.repository';
import { DepartmentService } from './department.service';
import { DepartmentController } from './controllers/department.controller';

@Module({
    imports: [],
    controllers: [DepartmentController],
    providers: [DepartmentService, DepartmentRepository],
    exports: [DepartmentService],
})
export class DepartmentModule {}
