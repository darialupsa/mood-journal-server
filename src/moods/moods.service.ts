import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mood } from './mood.entity';
import { MoodsActivitiesService } from '../moods-activities/moods-activities.service';
import { MoodDTO } from './mood.dto';

@Injectable()
export class MoodsService {
  constructor(
    @Inject(MoodsActivitiesService)
    private moodsActivitiesService: MoodsActivitiesService,
    @InjectRepository(Mood)
    private moodRepository: Repository<Mood>,
  ) {}

  async findAll(
    userId?: number,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<MoodDTO[]> {
    let recentMoods;

    if (userId) {
      if (pageSize && pageNumber) {
        recentMoods = await this.moodRepository.find({
          where: { userId },
          order: { date: 'DESC' },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        });
      } else {
        recentMoods = await this.moodRepository.find({
          where: { userId },
          order: { date: 'DESC' },
        });
      }
    } else {
      recentMoods = await this.moodRepository.find();
    }

    const moodsDTO = [];
    for (const mood of recentMoods) {
      const moodDTO = await this.transformMoodToMoodDTO(mood);
      moodsDTO.push(moodDTO);
    }

    return moodsDTO;
  }

  async findOne(id: number): Promise<MoodDTO> {
    const mood = await this.moodRepository.findOne({ where: { id } });

    if (!mood) {
      throw new NotFoundException(`Mood with id ${id} not found`);
    }

    const moodDTO = await this.transformMoodToMoodDTO(mood);
    return moodDTO;
  }

  async create(moodDTO: MoodDTO): Promise<MoodDTO> {
    // Create mood
    const mood = this.moodRepository.create({
      userId: moodDTO.userId,
      date: moodDTO.date,
      emotionId: moodDTO.emotionId,
      note: moodDTO.note,
    });
    const savedMood = await this.moodRepository.save(mood);

    // Save mood activities
    if (moodDTO.activities && moodDTO.activities.length > 0) {
      await this.moodsActivitiesService.saveMoodActivities(
        savedMood.id,
        moodDTO.activities,
      );
    }

    // Return created mood
    return { ...savedMood, activities: moodDTO.activities } as MoodDTO;
  }

  async update(id: number, moodDTO: MoodDTO): Promise<MoodDTO> {
    // Find mood by id
    const existingMood = await this.moodRepository.findOne({ where: { id } });
    if (!existingMood) {
      throw new NotFoundException(`Mood with id ${id} not found`);
    }

    // Update mood fields
    existingMood.userId = moodDTO.userId;
    existingMood.date = moodDTO.date;
    existingMood.emotionId = moodDTO.emotionId;
    existingMood.note = moodDTO.note;

    // Save mood
    const updatedMood = await this.moodRepository.save(existingMood);

    // Delete mood existing activities
    await this.moodsActivitiesService.deleteMoodActivities(id);

    // Save mood activities
    if (moodDTO.activities && moodDTO.activities.length > 0) {
      await this.moodsActivitiesService.saveMoodActivities(
        id,
        moodDTO.activities,
      );
    }

    // Return updated mood
    return {
      userId: updatedMood.userId,
      date: updatedMood.date,
      emotionId: updatedMood.emotionId,
      note: updatedMood.note,
      activities: moodDTO.activities,
    } as MoodDTO;
  }

  async delete(id: number): Promise<void> {
    // remove all activities
    await this.moodsActivitiesService.removeAllByMoodId(id);
    await this.moodRepository.delete(id);
  }

  async transformMoodToMoodDTO(mood: Mood) {
    const activities = await this.moodsActivitiesService.findAllByMoodId(
      mood.id,
    );

    return {
      id: mood.id,
      userId: mood.userId,
      date: mood.date,
      emotionId: mood.emotionId,
      note: mood.note,
      activities: activities.map((ma) => ma.activityId),
    };
  }
}
