import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'emotions' })
export class Emotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 20 })
  icon: string;

  @Column({ default: 1 }) // Presupunând că scorul implicit este 1
  score: number;
}
