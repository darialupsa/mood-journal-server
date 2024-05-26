/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionsModule } from './emotions/emotions.module';
import { UsersModule } from './users/users.module';
import { ActivitiesModule } from './activities/activities.module';
import { MoodsModule } from './moods/moods.module';
import { ChartsModule } from './charts/charts.module';



@Module({
  imports: [  
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'aws-0-eu-central-1.pooler.supabase.com',
      port: 5432,
      username: 'postgres.qbfkksrwsjnxbhpdgbcu',
      password: '1mRId2E7sYLzgBoA',
      database: 'postgres',      
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
     synchronize: false
    }),   
    UsersModule,
    EmotionsModule,
    ActivitiesModule,
    MoodsModule, 
    ChartsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
