import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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

  async activitiesPerDay(
    userId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<any[]> {
    if (!userId) {
      return [];
    }

    startDate =
      startDate ||
      moment()
        .subtract(1, 'months')
        .startOf('day')
        .format('yyyy-MM-DD HH:mm:ss');
    endDate = endDate || moment().endOf('day').format('yyyy-MM-DD HH:mm:ss');

    const userMoods = await this.moodRepository.find({
      where: {
        userId,
        date: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
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

  async emotionEvolution(
    userId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<any[]> {
    if (!userId) {
      return [];
    }

    startDate =
      startDate ||
      moment()
        .subtract(1, 'months')
        .startOf('day')
        .format('yyyy-MM-DD HH:mm:ss');
    endDate = endDate || moment().endOf('day').format('yyyy-MM-DD HH:mm:ss');

    const userMoods = await this.moodRepository.find({
      where: {
        userId,
        date: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
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

  async getUserMoodSuggestedActivity(userId: number): Promise<number[]> {
    const userMoods = await this.moodRepository.find({
      where: {
        userId,
      },
      order: { date: 'ASC' },
    });

    const emotions = await this.emotionRepository.find();
    const emotionScore = emotions.reduce((obj, emotion) => {
      obj[emotion.id] = emotion.score;
      return obj;
    }, {});

    const moods = userMoods.map((mood) => ({
      ...mood,
      score: emotionScore[mood.emotionId],
    }));

    // Identificarea mood-urilor speciale
    const specialActivities: { [id: number]: number } = {};
    for (let i = 0; i < moods.length - 6; i++) {
      const chain = moods.slice(i, i + 5); // 4 mood-uri rele și 1 bun
      const followUps = moods.slice(i + 5, i + 7); // cel puțin alte 2 mood-uri bune

      if (
        chain[0].score <= 3 &&
        chain[1].score <= 3 &&
        chain[2].score <= 3 &&
        chain[3].score <= 3 &&
        chain[4].score >= 4 &&
        followUps[0].score >= 4 &&
        followUps[1].score >= 4
      ) {
        const specialMood = chain[4];
        // incarca activitatile mood-ului zen
        const activities = await this.moodsActivitiesService.findAllByMoodId(
          specialMood.id,
        );

        activities.forEach((a) => {
          specialActivities[a.activityId] =
            (specialActivities[a.activityId] || 0) + 1;
        });
      }
    }
    // Găsește activitățile cu count maxim
    const maxCount = Math.max(...Object.values(specialActivities));
    const mostFrequentActivities = Object.keys(specialActivities)
      .filter((activityId) => specialActivities[activityId] === maxCount)
      .map((activityId) => parseInt(activityId, 10)); // Convertește string-urile în numere

    return mostFrequentActivities;
  }
}
