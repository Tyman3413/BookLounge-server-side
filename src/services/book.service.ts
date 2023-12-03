import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Books } from "src/models/books.entity";
import { Repository } from "typeorm";
import { BookDetails } from "../models/book-details.entity";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,
  ) {}

  async findAll(page: number, limit: number, sort: string, order: "ASC" | "DESC", genre: string[]): Promise<[Books[], number]> {
    const query = await this.bookRepository.createQueryBuilder("books").leftJoinAndSelect("books.details", "bookDetails");

    if (sort) {
      const sortField = sort.startsWith("bookDetails.") ? sort : `books.${sort}`;
      query.orderBy(sortField, order);
    }

    if (genre && genre.length > 0) {
      query.andWhere("bookDetails.genre IN (:genre)", { genre });
    }

    const [books, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [books, totalCount];
  }

  async findDiscountBooks(page: number, limit: number): Promise<Books[]> {
    return this.bookRepository
      .createQueryBuilder("books")
      .leftJoinAndSelect("books.details", "bookDetails")
      .where("bookDetails.old_price IS NOT NULL")
      .orderBy("books_id")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async findNewBooks(page: number, limit: number): Promise<Books[]> {
    return this.bookRepository
      .createQueryBuilder("books")
      .leftJoinAndSelect("books.details", "bookDetails")
      .orderBy("books.updated_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
}
