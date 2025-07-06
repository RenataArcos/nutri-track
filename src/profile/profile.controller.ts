// src/profile/profile.controller.ts
import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Patch } from '@nestjs/common';
import { Profile } from './profile.schema';

@Controller('api/profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    getAll() {
        return this.profileService.findAll();
    }

    @Post()
    create(@Body() body: { name: string; password: string; meals: string[] }) {
        return this.profileService.create(body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.profileService.delete(id);
    }

    @Post('register')
    async register(@Body() body: { name: string; password: string; meals?: string[] }) {
        const existing = await this.profileService.findByName(body.name);
        if (existing) {
            return { success: false, message: 'El nombre de usuario ya existe' };
        }

        const created = await this.profileService.create({
            name: body.name,
            password: body.password,
            meals: body.meals || [],
        });

        return { success: true, profile: created };
    }

    @Post('login')
    async login(@Body() body: { name: string; password: string }) {
        const profile = await this.profileService.findByName(body.name);
        if (!profile || profile.password !== body.password) {
            return { success: false, message: 'Credenciales inválidas' };
        }

        return { success: true, profile };
    }

    @Patch(':id')
    async updateProfile(@Param('id') id: string, @Body() data: Partial<Profile>) {
        const updated = await this.profileService.update(id, data);
        return { success: true, profile: updated };
    }

    @Get()
    async getProfile(@Query('name') name: string) {
        const profile = await this.profileService.findByName(name);
        if (!profile) {
            return { success: false, message: 'Perfil no encontrado' };
        }
        return { success: true, profile };
    }

}
