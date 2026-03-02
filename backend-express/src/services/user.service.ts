import { UserRepository } from '../repositories/user.repository';
import { ForbiddenError } from '../utils/AppError';

export class UserService {
    static async getUsers(query: any) {
        const { skip = '0', limit = '100', userRole } = query;

        // In Express, we can pass role safely via context, but we will protect it in routes or controller level usually.
        // Or we pass `Role` from controller down. Assuming `getUsers` should be Admin only.
        return UserRepository.findAll(parseInt(String(skip)), parseInt(String(limit)));
    }

    static async getTechnicians(query: any) {
        const { skip = '0', limit = '100' } = query;

        return UserRepository.findTechnicians(parseInt(String(skip)), parseInt(String(limit)));
    }
}
