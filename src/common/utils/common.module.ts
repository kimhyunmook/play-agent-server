import { TransactionHost } from '@nestjs-cls/transactional';
import { Global, Module } from '@nestjs/common';
import { PrismaTxHost } from './common.repository';

@Global()
@Module({
    providers: [
        {
            provide: PrismaTxHost,
            useExisting: TransactionHost,
        },
    ],
    exports: [PrismaTxHost],
})
export class CommonModule {}
