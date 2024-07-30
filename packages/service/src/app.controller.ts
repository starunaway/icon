import { All, Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @All('/healthCheck')
  healthCheck(): string {
    return 'icon service ok';
  }
}
