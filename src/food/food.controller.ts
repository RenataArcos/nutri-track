import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('api/food')
export class FoodController {
    constructor(private readonly foodService: FoodService) { }

    @Post()
    async create(@Body() body: any) {
        const existing = await this.foodService.findByUserAndName(body.userId, body.name);
        if (existing) {
            return { success: false, message: 'Este alimento ya existe' };
        }

        const food = await this.foodService.create(body);
        return { success: true, food };
    }


    @Get()
    async getByUserAndDate(@Query('userId') userId: string, @Query('date') date: string) {
        const foods = await this.foodService.findByUserAndDate(userId, date);
        return { success: true, foods };
    }
}
