import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChartsService } from './charts.service';

@Controller('charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('activitiesPerDay/:id')
  activitiesByDate(@Param('id') id?: string): Promise<any[]> {
    return this.chartsService.activitiesPerDay(+id);
  }

  @Get('emotionEvolution/:id')
  emotionEvolution(@Param('id') id?: string): Promise<any[]> {
    return this.chartsService.emotionEvolution(+id);
  }

  @Get('yearInPixels/:id')
  yearInPixels(
    @Param('id') id?: string,
    @Query('year') year?: string,
  ): Promise<any[]> {
    return this.chartsService.yearInPixels(+id, +year);
  }

  @Get('monthInPixels/:id')
  monthInPixels(
    @Param('id') id?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<any[]> {
    return this.chartsService.monthInPixels(+id, +year, +month);
  }

  @Get('dateRange/:id')
  dateRange(@Param('id') id?: string): Promise<any> {
    return this.chartsService.getUserMoodDateRange(+id);
  }
}
