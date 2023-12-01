import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Функция генерации JWT-токена
  async generateToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  // Функция проверки JWT-токена
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw error;
    }
  }
}
