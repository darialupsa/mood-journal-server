import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'activities' })
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  name: string;

  @Column()
  icon: string;
}
