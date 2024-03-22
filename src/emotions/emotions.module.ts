import { Module } from '@nestjs/common';
import { Emotion } from './emotion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionsController } from './emotions.controller';
import { EmotionsService } from './emotions.service';

@Module({
  controllers: [EmotionsController],
  providers: [EmotionsService],
  exports: [EmotionsService],
  imports: [TypeOrmModule.forFeature([Emotion])],
})
export class EmotionsModule {}
