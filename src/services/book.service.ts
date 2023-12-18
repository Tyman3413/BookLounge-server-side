import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Books } from "src/entities/books.entity";
import { Repository } from "typeorm";
import { BookDetails } from "../entities/book-details.entity";
import { Genres } from "../entities/genres.entity";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,

    @InjectRepository(Genres)
    private readonly genresRepository: Repository<Genres>,
  ) {}

  async findAll(page: number, limit: number, sort: string, genre: string | string[]): Promise<[Books[], number]> {
    const query = await this.bookRepository.createQueryBuilder("books").leftJoinAndSelect("books.details", "bookDetails");

    if (sort === "news") {
      query.orderBy("books.updated_at", "DESC");
    } else if (sort === "priceHigh") {
      query.orderBy("bookDetails.price", "DESC");
    } else if (sort === "priceLow") {
      query.orderBy("bookDetails.price", "ASC");
    }

    if (genre) {
      const genreArray = Array.isArray(genre) ? genre : genre.split(",");
      const genreConditions = genreArray.map(g => this.buildGenreCondition(g.trim()));
      query.andWhere(`(${genreConditions.join(" OR ")})`);
    }

    const [books, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [books, totalCount];
  }

  private buildGenreCondition(genre: string): string {
    if (genre === "Афоризмы") {
      return "LOWER(bookDetails.genre) LIKE '%афоризмы%'";
    } else if (genre === "Басни") {
      return "LOWER(bookDetails.genre) LIKE '%басни%'";
    } else if (genre === "Детективы") {
      return "LOWER(bookDetails.genre) LIKE '%детектив%'";
    } else if (genre === "Драматургия") {
      return "LOWER(bookDetails.genre) LIKE '%драма%'";
    } else if (genre === "Историческая проза") {
      return "LOWER(bookDetails.genre) LIKE '%истор%' AND (LOWER(bookDetails.genre) LIKE '%проза%' OR LOWER(bookDetails.genre) LIKE '%роман%')";
    } else if (genre === "Классическая проза") {
      return "LOWER(bookDetails.genre) LIKE '%класс%' AND (LOWER(bookDetails.genre) LIKE '%проза%' OR LOWER(bookDetails.genre) LIKE '%роман%')";
    } else if (genre === "Отечественный боевик") {
      return "LOWER(bookDetails.genre) LIKE '%триллер%' OR LOWER(bookDetails.genre) LIKE '%боевик%'";
    } else if (genre === "Поэзия") {
      return "LOWER(bookDetails.genre) LIKE '%поэзия%'";
    } else if (genre === "Приключения") {
      return "LOWER(bookDetails.genre) LIKE '%приключ%'";
    } else if (genre === "Сентиментальная проза") {
      return "LOWER(bookDetails.genre) LIKE '%сентимиент%' AND (LOWER(bookDetails.genre) LIKE '%проза%' OR LOWER(bookDetails.genre) LIKE '%роман%')";
    } else if (genre === "Современная проза") {
      return "LOWER(bookDetails.genre) LIKE '%совр%' AND (LOWER(bookDetails.genre) LIKE '%проза%' OR LOWER(bookDetails.genre) LIKE '%роман%')";
    } else if (genre === "Фантастика") {
      return "LOWER(bookDetails.genre) LIKE '%фантаст%'";
    } else if (genre === "Фэнтези") {
      return "LOWER(bookDetails.genre) LIKE '%фэнтези%' OR LOWER(bookDetails.genre) LIKE '%новел%'";
    } else if (genre === "Эпос и фольклор") {
      return "LOWER(bookDetails.genre) LIKE '%эпос%' OR LOWER(bookDetails.genre) LIKE '%муз%'";
    }

    return "";
  }

  async findDiscountBooks(page: number, limit: number, sort: string, genre: string | string[]): Promise<[Books[], number]> {
    const query = await this.bookRepository.createQueryBuilder("books").leftJoinAndSelect("books.details", "bookDetails").where("bookDetails.old_price IS NOT NULL");

    if (sort === "news") {
      query.orderBy("books.updated_at", "DESC");
    } else if (sort === "priceHigh") {
      query.orderBy("bookDetails.price", "DESC");
    } else if (sort === "priceLow") {
      query.orderBy("bookDetails.price", "ASC");
    }

    if (genre) {
      const genreArray = Array.isArray(genre) ? genre : genre.split(",");
      const genreConditions = genreArray.map(g => this.buildGenreCondition(g.trim()));
      query.andWhere(`(${genreConditions.join(" OR ")})`);
    }

    const [books, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [books, totalCount];
  }

  async findNewBooks(page: number, limit: number, sort: string, genre: string | string[]): Promise<[Books[], number]> {
    const query = await this.bookRepository.createQueryBuilder("books").leftJoinAndSelect("books.details", "bookDetails").orderBy("books.updated_at", "DESC");

    if (sort === "news") {
      query.orderBy("books.updated_at", "DESC");
    } else if (sort === "priceHigh") {
      query.orderBy("bookDetails.price", "DESC");
    } else if (sort === "priceLow") {
      query.orderBy("bookDetails.price", "ASC");
    }

    if (genre) {
      const genreArray = Array.isArray(genre) ? genre : genre.split(",");
      const genreConditions = genreArray.map(g => this.buildGenreCondition(g.trim()));
      query.andWhere(`(${genreConditions.join(" OR ")})`);
    }

    const [books, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [books, totalCount];
  }

  async findGenres(): Promise<Genres[]> {
    return await this.genresRepository.createQueryBuilder("genres").getMany();
  }
}
