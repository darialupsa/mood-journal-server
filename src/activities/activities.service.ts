import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Activity } from './activity.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async findAll(userId?: number): Promise<Activity[]> {
    if (userId) {
      const generalActivities = await this.activityRepository.find({
        where: { userId: IsNull() },
      });
      const userActivities = await this.activityRepository.find({
        where: { userId },
      });
      return generalActivities.concat(userActivities);
    } else {
      return this.activityRepository.find();
    }
  }
  async findOne(id: number): Promise<Activity> {
    return this.activityRepository.findOne({ where: { id } });
  }

  async create(activityData: Activity): Promise<Activity> {
    const activity = this.activityRepository.create(activityData);
    return this.activityRepository.save(activity);
  }

  async update(id: number, activityData: Partial<Activity>): Promise<Activity> {
    await this.activityRepository.update(id, activityData);
    return this.activityRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.activityRepository.delete(id);
  }
}
