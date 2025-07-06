import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Food, FoodDocument } from './food.schema';
import { Model } from 'mongoose';

@Injectable()
export class FoodService {
    constructor(@InjectModel(Food.name) private foodModel: Model<FoodDocument>) { }

    create(food: Partial<Food>) {
        return new this.foodModel(food).save();
    }

    findByUserAndDate(userId: string, date: string) {
        return this.foodModel.find({ userId, date }).exec();
    }

    async findByUserAndName(userId: string, name: string) {
        return this.foodModel.findOne({ userId, name }).exec();
    }

}
