import {
  Controller,
  Param,
  Get,
  Delete,
  Body,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Activity } from './activity.entity';

@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get()
  findAll(@Query('userId') userId?: string): Promise<Activity[]> {
    return this.activitiesService.findAll(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOne(+id);
  }

  @Post()
  create(@Body() createActivityDto: Activity): Promise<Activity> {
    return this.activitiesService.create(createActivityDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: Activity,
  ): Promise<Activity> {
    return this.activitiesService.update(+id, updateActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.activitiesService.delete(+id);
  }
}
