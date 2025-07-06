// src/consumed/consumed.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ConsumedService } from './consumed.service';

@Controller('api/consumed')
export class ConsumedController {
    constructor(private readonly consumedService: ConsumedService) { }

    @Post()
    async create(@Body() body: any) {
        const created = await this.consumedService.create(body);
        return { success: true, consumed: created };
    }

    @Get()
    async getByUserAndDate(@Query('userId') userId: string, @Query('date') date?: string) {
        const entries = await this.consumedService.findByUserAndDate(userId, date);
        console.log('Consumed entries:', entries);
        return { success: true, entries };
    }
}
