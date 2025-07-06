// src/profile/profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema()
export class Profile {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: [String], default: [] })
    meals: string[];

    // Nuevos campos
    @Prop()
    weight?: number;

    @Prop()
    height?: number;

    @Prop()
    activityLevel?: string;

    @Prop()
    targetCalories?: number;

    @Prop()
    targetProtein?: number;

    @Prop()
    targetCarbs?: number;

    @Prop()
    targetFats?: number;

    @Prop({ enum: ['perder_grasa', 'mantener', 'ganar_musculo'], default: 'mantener' })
    goal: string;

    @Prop({ enum: ['masculino', 'femenino'], default: 'femenino' })
    sex: string;

    @Prop({ type: Number })
    age: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
