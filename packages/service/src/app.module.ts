import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { IconModule } from './module/icon/icon.module';

const isProd = process.env.RUNNING_ENV == 'production';

let envFilePath = ['.env'];

if (isProd) {
  envFilePath.unshift('.env_prod');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      autoLoadEntities: true, //自动加载实体
      host: process.env.SQL_HOST,
      port: parseInt(process.env.SQL_PORT), // 端口号
      username: process.env.SQL_USERNAME, // 用户名
      password: process.env.SQL_PASSWORD, // 密码
      database: process.env.SQL_DATABASE, //数据库名
      synchronize: true, //是否自动同步实体文件,生产环境建议关闭
      timezone: 'Asia/Shanghai', // 设置时区
    }),

    // WebhookModule,
    // ScmModule,
    // ScmVersionModule,
    // OssModule,
    IconModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
