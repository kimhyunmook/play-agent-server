import { Prisma } from '@prisma/client';
import { AgentCreateDto } from '../dto/agent.create.dto';

export function validator(data: AgentCreateDto): Prisma.AgentCreateArgs {
    const { creatorId, ...rest } = data;
    return Prisma.validator<Prisma.AgentCreateArgs>()({
        data: {
            ...rest,
            creator: { connect: { id: creatorId } },
        },
    });
}
