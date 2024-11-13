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
import { JobController } from './job.controller';



@Module({
  imports: [  
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'aws-0-eu-central-1.pooler.supabase.com',
      port: 6543,
      username: 'postgres.scgskztvwmhpptkzoxlm',
      password: 'YMAXdGNrhFkNPgcW',
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
  controllers: [AppController,JobController],
  providers: [AppService],
})
export class AppModule {}
