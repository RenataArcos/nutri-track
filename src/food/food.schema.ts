import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FoodDocument = Food & Document;

// src/food/food.schema.ts

@Schema()
export class Food {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ required: true }) // ej: “Manzana”, “Arroz cocido”
    name: string;

    @Prop()
    calories: number;

    @Prop()
    protein: number;

    @Prop()
    carbs: number;

    @Prop()
    fats: number;
}

export const FoodSchema = SchemaFactory.createForClass(Food);
