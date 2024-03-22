import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoodActivity } from './mood-activity.entity';

@Injectable()
export class MoodsActivitiesService {
  constructor(
    @InjectRepository(MoodActivity)
    private readonly moodsActivitiesRepository: Repository<MoodActivity>,
  ) {}

  findAllByMoodId(moodId: number) {
    return this.moodsActivitiesRepository.find({ where: { moodId } });
  }

  async countActivitiesByMoodId(moodId: number): Promise<number> {
    return this.moodsActivitiesRepository.count({ where: { moodId } });
  }

  saveMoodActivities(
    moodId: number,
    activityIds: number[],
  ): Promise<MoodActivity[]> {
    const moodsActivities = activityIds.map((activityId) => {
      const moodsActivity = new MoodActivity();
      moodsActivity.moodId = moodId;
      moodsActivity.activityId = activityId;
      return moodsActivity;
    });

    return this.moodsActivitiesRepository.save(moodsActivities);
  }

  deleteMoodActivities(moodId: number) {
    return this.moodsActivitiesRepository.delete({
      moodId,
    });
  }

  removeAllByMoodId(moodId: number) {
    return this.moodsActivitiesRepository.delete({ moodId: moodId });
  }
}
