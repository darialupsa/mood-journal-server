import { Module } from '@nestjs/common';
import { MoodsController } from './moods.controller';
import { MoodsService } from './moods.service';
import { Mood } from './mood.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodsActivitiesModule } from '../moods-activities/moods-activities.module';

@Module({
  controllers: [MoodsController],
  providers: [MoodsService],
  exports: [MoodsService],
  imports: [TypeOrmModule.forFeature([Mood]), MoodsActivitiesModule],
})
export class MoodsModule {}
