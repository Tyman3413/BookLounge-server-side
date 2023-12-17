import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Books } from "src/entities/books.entity";
import { Repository } from "typeorm";
import { BookDetails } from "../entities/book-details.entity";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,
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
      const genresArray = Array.isArray(genre) ? genre : [genre];
      if (genresArray.length > 0) {
        query.andWhere("bookDetails.genre IN (:...genres)", { genres: genresArray });
      }
    }

    const [books, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [books, totalCount];
  }

  async findDiscountBooks(page: number, limit: number): Promise<[Books[], number]> {
    const query = await this.bookRepository
      .createQueryBuilder("books")
      .leftJoinAndSelect("books.details", "bookDetails")
      .where("bookDetails.old_price IS NOT NULL")
      .orderBy("books_id");

    const [books, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [books, totalCount];
  }

  async findNewBooks(page: number, limit: number): Promise<[Books[], number]> {
    const query = await this.bookRepository.createQueryBuilder("books").leftJoinAndSelect("books.details", "bookDetails").orderBy("books.updated_at", "DESC");

    const [books, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [books, totalCount];
  }
}
