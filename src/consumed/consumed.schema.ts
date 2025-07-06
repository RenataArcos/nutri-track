// src/consumed/consumed.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Food } from '../food/food.schema';

export type ConsumedDocument = Consumed & Document;

@Schema()
export class Consumed {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
    foodId: Types.ObjectId;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    quantity: number;
}

export const ConsumedSchema = SchemaFactory.createForClass(Consumed);
