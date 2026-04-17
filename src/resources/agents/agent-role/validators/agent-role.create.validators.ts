import { Prisma } from '@prisma/client';
import { AgentRoleCreateDto } from '../dto/agent-role.create.dto';

export function validator(data: AgentRoleCreateDto): Prisma.AgentRoleCreateArgs {
    const { ownerId, ...rest } = data;
    return Prisma.validator<Prisma.AgentRoleCreateArgs>()({
        data: {
            ...rest,
            owner: ownerId !== undefined && ownerId !== null ? { connect: { id: ownerId } } : undefined,
        },
    });
}
