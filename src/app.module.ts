import { Module } from "@nestjs/common";
import { DatabaseModule } from "./modules/database/database.module";
import { AuthController } from "./controllers/auth.controller";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from "dotenv";
import { JwtAuthService } from "./services/jwt/jwt.service";
import { Logger } from "./services/logger.service";

// Настройка .env файла
dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtAuthService, Logger],
})
export class AppModule {}
