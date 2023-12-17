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

  async findAll(page: number, limit: number, sort: string, genre: string): Promise<[Books[], number]> {
    const query = await this.bookRepository.createQueryBuilder("books").leftJoinAndSelect("books.details", "bookDetails");

    if (sort === "news") {
      query.orderBy("books.updated_at", "DESC");
    } else if (sort === "priceHigh") {
      query.orderBy("bookDetails.price", "DESC");
    } else if (sort === "priceLow") {
      query.orderBy("bookDetails.price", "ASC");
    }

    if (genre === "thrillers") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreThriller OR LOWER(bookDetails.genre) LIKE :genreAction", {
        genreThriller: "%триллер%",
        genreAction: "%боевик%",
      });
    } else if (genre === "detective") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreDetective", {
        genreDetective: "%детектив%",
      });
    } else if (genre === "drama") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreDrama", {
        genreDrama: "%драма%",
      });
    } else if (genre === "foreign") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreForeign", {
        genreForeign: "%зарубежная%",
      });
    } else if (genre === "journey") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreJourney", {
        genreJourney: "%приключ%",
      });
    } else if (genre === "comics") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreNovel OR LOWER(bookDetails.genre) LIKE :genreJapan", {
        genreNovel: "%новел%",
        genreJapan: "ранобэ",
      });
    } else if (genre === "romance") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreRomance", {
        genreRomance: "%роман%",
      });
    } else if (genre === "poetry") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genrePoetry", {
        genrePoetry: "%поэзия%",
      });
    } else if (genre === "prose") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreProse", {
        genreProse: "%проза%",
      });
    } else if (genre === "horror") {
      query.andWhere("LOWER(bookDetails.genre) LIKE :genreHorror OR LOWER(bookDetails.genre) LIKE :genreMystic", {
        genreHorror: "%ужасы%",
        genreMystic: "%мист%",
      });
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
