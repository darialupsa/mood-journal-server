import { Module } from '@nestjs/common';
import { ChartsController } from './charts.controller';
import { ChartsService } from './charts.service';
import { MoodsActivitiesModule } from '../moods-activities/moods-activities.module';
import { Mood } from '../moods/mood.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emotion } from '../emotions/emotion.entity';

@Module({
  controllers: [ChartsController],
  providers: [ChartsService],
  exports: [ChartsService],
  imports: [
    TypeOrmModule.forFeature([Mood]),
    TypeOrmModule.forFeature([Emotion]),
    MoodsActivitiesModule,
  ],
})
export class ChartsModule {}
