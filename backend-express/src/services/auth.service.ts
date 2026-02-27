import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export class AuthService {
    static async register(userData: any) {
        const { email, name, password } = userData;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role: 'requester', // Hardcode default role to prevent privilege escalation
            }
        });

        const token = jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            access_token: token,
            token_type: 'bearer',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                is_active: user.isActive
            }
        };
    }

    static async login(credentials: any) {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            access_token: token,
            token_type: 'bearer',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                is_active: user.isActive
            }
        };
    }
}
