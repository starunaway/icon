import { Logger, Module } from '@nestjs/common';
import { IconService } from './icon.service';
import { IconController } from './icon.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconEntity } from './entities/icon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IconEntity])],
  controllers: [IconController],
  providers: [
    IconService,
    {
      provide: 'IconLogger',
      useFactory: () => {
        return new Logger('icon');
      },
    },
  ],
  exports: [IconService],
})
export class IconModule {}
