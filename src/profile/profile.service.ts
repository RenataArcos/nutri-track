// src/profile/profile.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Profile, ProfileDocument } from './profile.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProfileService {
    constructor(@InjectModel(Profile.name) private profileModel: Model<ProfileDocument>) { }

    findAll() {
        return this.profileModel.find().exec();
    }

    create(data: { name: string; password: string; meals: string[] }) {
        const profile = new this.profileModel(data);
        return profile.save();
    }

    delete(id: string) {
        return this.profileModel.findByIdAndDelete(id).exec();
    }

    // 🔧 AGREGAR ESTE MÉTODO
    findByName(name: string) {
        return this.profileModel.findOne({ name }).exec();
    }

    async update(id: string, data: Partial<Profile>) {

        function calcularMetas({ peso, altura, actividad, goal, sex, edad }: any) {
            const actividadMultipliers = {
                sedentario: 1.2,
                ligero: 1.375,
                moderado: 1.55,
                intenso: 1.725,
            };

            const tmb =
                10 * peso + 6.25 * altura - 5 * edad + (sex === 'masculino' ? 5 : -161);

            let calorias = tmb * actividadMultipliers[actividad || 'sedentario'];

            if (goal === 'perder_grasa') calorias *= 0.8;
            else if (goal === 'ganar_musculo') calorias *= 1.15;

            const proteina = peso * 2;
            const grasas = peso * 0.8;
            const carbs = (calorias - (proteina * 4 + grasas * 9)) / 4;

            return {
                targetCalories: Math.round(calorias),
                targetProtein: Math.round(proteina),
                targetFats: Math.round(grasas),
                targetCarbs: Math.round(carbs),
            };
        }

        // Si tiene los datos necesarios, calcular metas
        const { weight, height, activityLevel, goal, sex, age } = data;
        console.log('Actualizando perfil con datos:', data);
        console.log(weight && height && activityLevel && goal && sex && age);
        if (weight && height && activityLevel && goal && sex && age) {
            const metas = calcularMetas({ peso: weight, altura: height, actividad: activityLevel, goal, sex, edad: age });

            // Agregar metas calculadas al objeto data
            console.log('Metas calculadas:', metas);
            Object.assign(data, metas);

        }

        return this.profileModel.findByIdAndUpdate(id, data, { new: true }).exec();

    }
}
