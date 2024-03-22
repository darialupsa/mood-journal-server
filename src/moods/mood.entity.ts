import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'moods' })
export class Mood {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'emotion_id', nullable: false })
  emotionId: number;

  @Column({ type: 'text', nullable: true })
  note: string;
}
