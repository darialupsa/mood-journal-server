import { Controller, Get } from '@nestjs/common';
import { Emotion } from './emotion.entity';
import { EmotionsService } from './emotions.service';

@Controller('emotions')
export class EmotionsController {
  constructor(private emotionsService: EmotionsService) {}

  @Get()
  findAll(): Promise<Emotion[]> {
    return this.emotionsService.findAll();
  }
}
