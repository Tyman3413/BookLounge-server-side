import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { JwtAuthService } from "src/services/jwt/jwt.service";
import { AuthController } from "src/controllers/auth.controller";
import { ParseBookController } from "src/controllers/book-parser.controller";
import { BookController } from "src/controllers/book.controller";
import { User } from "src/entities/user.entity";
import { LabirintBookParserService } from "src/services/labirint-parser.service";
import { BookService } from "src/services/book.service";
import { Books } from "src/entities/books.entity";
import { BookDetails } from "src/entities/book-details.entity";
import { ChitaiGorodParserService } from "../../services/chitai-gorod-parser.service";
import { Logger } from "../../services/logger.service";
import { Genres } from "../../entities/genres.entity";
import { GenresParserService } from "../../services/genres-parser.service";
import { Bookmarks } from "../../entities/bookmarks.entity";
import { BookmarksService } from "../../services/bookmarks.service";
import { BookmarksController } from "../../controllers/bookmarks.controller";

// Настройка .env файла
dotenv.config();

@Module({
  imports: [
    // Конфигурация подключения к базе данных PostgreSQL
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Bookmarks, Books, BookDetails, Genres],
      synchronize: true,
    }),

    // Подключение сущности User
    TypeOrmModule.forFeature([User, Bookmarks, Books, BookDetails, Genres]),

    // Регистрация JWT-токена
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "3d" }, // токен истекает через 3 дня
    }),
  ],
  controllers: [AuthController, ParseBookController, BookController, BookmarksController],
  exports: [TypeOrmModule],
  providers: [JwtAuthService, BookService, LabirintBookParserService, ChitaiGorodParserService, Logger, GenresParserService, BookmarksService],
})
export class DatabaseModule {}
