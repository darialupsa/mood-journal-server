import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'moods_activities' })
export class MoodActivity {
  @PrimaryColumn({ name: 'mood_id', nullable: false })
  moodId: number;

  @PrimaryColumn({ name: 'activity_id', nullable: false })
  activityId: number;
}
