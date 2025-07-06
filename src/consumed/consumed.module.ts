// src/consumed/consumed.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Consumed, ConsumedSchema } from './consumed.schema';
import { ConsumedService } from './consumed.service';
import { ConsumedController } from './consumed.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Consumed.name, schema: ConsumedSchema }])],
    providers: [ConsumedService],
    controllers: [ConsumedController],
})
export class ConsumedModule { }
