import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter, TransformInterceptor } from './common';
// import { HttpExceptionFilter } from './common/http-exception';

const globalApiPrefix = '/api';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix(globalApiPrefix);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT || 3000);
}
bootstrap().then(() => {
  console.log('server started');
  console.log('icon service run on port ' + process.env.PORT || 3000);
});
