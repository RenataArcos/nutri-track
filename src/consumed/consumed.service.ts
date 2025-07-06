// src/consumed/consumed.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Consumed, ConsumedDocument } from './consumed.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ConsumedService {
    constructor(@InjectModel(Consumed.name) private consumedModel: Model<ConsumedDocument>) { }

    async create(data: Partial<Consumed>) {
        console.log('Creating consumed entry:', data);
        return new this.consumedModel(data).save();
    }

    async findByUserAndDate(userId: string, date?: string) {
        const filter: any = { userId };      // <-- siempre por usuario
        if (date) filter.date = date;        // <-- solo agrega fecha si viene
        return this.consumedModel
            .find(filter)
            .populate('foodId')
            .sort({ date: -1 })         // opcional: más nuevo primero
            .exec();
    }
}
