import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { MoodsService } from './moods.service';
import { MoodDTO } from './mood.dto';

@Controller('moods')
export class MoodsController {
  constructor(private moodsService: MoodsService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('pageNumber') pageNumber?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<MoodDTO[]> {
    return this.moodsService.findAll(+userId, +pageNumber, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<MoodDTO> {
    return this.moodsService.findOne(+id);
  }

  @Post()
  create(@Body() moodDTO: MoodDTO): Promise<MoodDTO> {
    return this.moodsService.create(moodDTO);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() moodDTO: MoodDTO): Promise<MoodDTO> {
    return this.moodsService.update(+id, moodDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.moodsService.delete(+id);
  }
}
