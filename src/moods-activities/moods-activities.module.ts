import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodsActivitiesService } from './moods-activities.service';
import { MoodActivity } from './mood-activity.entity';

@Module({
  providers: [MoodsActivitiesService],
  exports: [MoodsActivitiesService],
  imports: [TypeOrmModule.forFeature([MoodActivity])],
})
export class MoodsActivitiesModule {}
