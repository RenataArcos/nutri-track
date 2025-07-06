// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileModule } from './profile/profile.module';
import { FoodModule } from './food/food.module';
import { ConsumedModule } from './consumed/consumed.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/miapp'),
    ProfileModule,
    FoodModule,
    ConsumedModule,
  ],
})
export class AppModule { }
