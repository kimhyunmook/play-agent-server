import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Account = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request['user'];
    return data ? user?.[data] : user;
});
