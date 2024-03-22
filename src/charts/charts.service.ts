import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { MoodsActivitiesService } from '../moods-activities/moods-activities.service';
import { Mood } from '../moods/mood.entity';
import * as moment from 'moment';
import { Emotion } from '../emotions/emotion.entity';

@Injectable()
export class ChartsService {
  constructor(
    @Inject(MoodsActivitiesService)
    private moodsActivitiesService: MoodsActivitiesService,
    @InjectRepository(Mood)
    private moodRepository: Repository<Mood>,
    @InjectRepository(Emotion)
    private emotionRepository: Repository<Emotion>,
  ) {}

  async activitiesPerDay(userId: number): Promise<any[]> {
    if (!userId) {
      return [];
    }

    const oneMonthsAgo = moment().subtract(1, 'months');

    const userMoods = await this.moodRepository.find({
      where: {
        userId,
        date: MoreThanOrEqual(oneMonthsAgo.format('yyyy-MM-DD 00:00:00')),
      },
      order: { date: 'ASC' },
    });

    const result = {};

    for (const mood of userMoods) {
      const activitiesCount =
        await this.moodsActivitiesService.countActivitiesByMoodId(mood.id);

      const moodDate = moment(mood.date, 'yyyy-MM-DD HH:mm:ss').format(
        'yyyy-MM-DD',
      );

      result[moodDate] = (result[moodDate] || 0) + activitiesCount;
    }

    const activitiesByDay = Object.keys(result).map((date) => ({
      date,
      count: result[date],
    }));

    return activitiesByDay;
  }

  async emotionEvolution(userId: number): Promise<any[]> {
    if (!userId) {
      return [];
    }

    const oneMonthsAgo = moment().subtract(1, 'months');

    const userMoods = await this.moodRepository.find({
      where: {
        userId,
        date: MoreThanOrEqual(oneMonthsAgo.format('yyyy-MM-DD 00:00:00')),
      },
      order: { date: 'ASC' },
    });

    const emotions = await this.emotionRepository.find();
    const emotionScore = emotions.reduce((obj, emotion) => {
      obj[emotion.id] = emotion.score;
      return obj;
    }, {});

    return userMoods.map((mood) => ({
      date: mood.date,
      score: emotionScore[mood.emotionId],
    }));
  }

  async yearInPixels(userId: number, year?: number): Promise<any[]> {
    if (!userId) {
      return [];
    }

    year = year || moment().year();

    const startDate = `${year}-01-01 00:00:00`;
    const endDate = `${year}-12-31 23:59:59`;

    const userMoods = await this.moodRepository
      .createQueryBuilder('mood')
      .where('mood.userId = :userId', { userId })
      .andWhere('mood.date >= :startDate', { startDate })
      .andWhere('mood.date <= :endDate', { endDate })
      .orderBy('mood.date', 'ASC')
      .getMany();

    const moodGroupsPerDay = {};
    for (const mood of userMoods) {
      const day = moment(mood.date, 'yyyy-MM-DD HH:mm:ss').format('yyyy-MM-DD');
      moodGroupsPerDay[day] = moodGroupsPerDay[day] || [];
      moodGroupsPerDay[day].push(mood);
    }

    const emotions = await this.emotionRepository.find();
    const emotionScore = emotions.reduce((obj, emotion) => {
      obj[emotion.id] = emotion.score;
      return obj;
    }, {});

    return Object.keys(moodGroupsPerDay).map((day) => ({
      date: day,
      score: this.calculateAvgMood(moodGroupsPerDay[day], emotionScore),
    }));
  }

  async monthInPixels(
    userId: number,
    year?: number,
    month?: number,
  ): Promise<any[]> {
    if (!userId) {
      return [];
    }

    year = year || moment().year();
    month = month || moment().month() + 1;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
    const endDate = moment(startDate, 'yyyy-MM-DD HH:mm:ss')
      .endOf('month')
      .format('yyyy-MM-DD HH:mm:ss');

    const userMoods = await this.moodRepository
      .createQueryBuilder('mood')
      .where('mood.userId = :userId', { userId })
      .andWhere('mood.date >= :startDate', { startDate })
      .andWhere('mood.date <= :endDate', { endDate })
      .orderBy('mood.date', 'ASC')
      .getMany();

    const moodGroupsPerDay = {};
    for (const mood of userMoods) {
      const day = moment(mood.date, 'yyyy-MM-DD HH:mm:ss').format('yyyy-MM-DD');
      moodGroupsPerDay[day] = moodGroupsPerDay[day] || [];
      moodGroupsPerDay[day].push(mood);
    }

    const emotions = await this.emotionRepository.find();
    const emotionScore = emotions.reduce((obj, emotion) => {
      obj[emotion.id] = emotion.score;
      return obj;
    }, {});

    return Object.keys(moodGroupsPerDay).map((day) => ({
      date: day,
      score: this.calculateAvgMood(moodGroupsPerDay[day], emotionScore),
    }));
  }

  async getUserMoodDateRange(
    userId: number,
  ): Promise<{ minDate: Date; maxDate: Date }> {
    const minMaxDates = await this.moodRepository
      .createQueryBuilder('mood')
      .select('MIN(mood.date)', 'minDate')
      .addSelect('MAX(mood.date)', 'maxDate')
      .where('mood.userId = :userId', { userId })
      .getRawOne();

    return {
      minDate: minMaxDates.minDate,
      maxDate: minMaxDates.maxDate,
    };
  }

  public calculateAvgMood(moods, emotionScore): number {
    if (!moods?.length) return 0;

    const sum = moods.reduce((sum, mood) => {
      sum += emotionScore[mood.emotionId];
      return sum;
    }, 0);

    return Math.round(sum / moods.length);
  }
}
