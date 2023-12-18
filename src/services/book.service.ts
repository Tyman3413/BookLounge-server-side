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

    // if (typeof genre === "string") {
    //   if (genre === "Афоризмы") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genresAphorisms", {
    //       genresAphorisms: "%афоризмы%",
    //     });
    //   } else if (genre === "Басни") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genresFables", {
    //       genresFables: "%басни%",
    //     });
    //   } else if (genre === "Детективы") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreDetective", {
    //       genreDetective: "%детектив%",
    //     });
    //   } else if (genre === "Драматургия") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreDrama", {
    //       genreDrama: "%драма%",
    //     });
    //   } else if (genre === "Историческая проза") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreHistoric AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
    //       genreProse: "%проза%",
    //       genreHistoric: "%истор%",
    //       genreRomance: "%роман%",
    //     });
    //   } else if (genre === "Классическая проза") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreClassic AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
    //       genreClassic: "%класс%",
    //       genreProse: "%проза%",
    //       genreRomance: "%роман%",
    //     });
    //   } else if (genre === "Отечественный боевик") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreThriller OR LOWER(bookDetails.genre) LIKE :genreAction", {
    //       genreThriller: "%триллер%",
    //       genreAction: "%боевик%",
    //     });
    //   } else if (genre === "Поэзия") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genrePoetry", {
    //       genrePoetry: "%поэзия%",
    //     });
    //   } else if (genre === "Приключения") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreJourney", {
    //       genreJourney: "%приключ%",
    //     });
    //   } else if (genre === "Сентиментальная проза") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreSentimental AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
    //       genreSentimental: "%сентимиент%",
    //       genreProse: "%проза%",
    //       genreRomance: "%роман%",
    //     });
    //   } else if (genre === "Современная проза") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreModern AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
    //       genreModern: "%совр%",
    //       genreProse: "%проза%",
    //       genreRomance: "%роман%",
    //     });
    //   } else if (genre === "Фантастика") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreFantastic", {
    //       genreFantastic: "%фантаст%",
    //     });
    //   } else if (genre === "Фэнтези") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreFantasy OR LOWER(bookDetails.genre) LIKE :genreNovel", {
    //       genreFantasy: "%фэнтези%",
    //       genreNovel: "%новел%",
    //     });
    //   } else if (genre === "Эпос и фольклор") {
    //     query.andWhere("LOWER(bookDetails.genre) LIKE :genreEpic OR LOWER(bookDetails.genre) LIKE :genreMusic", {
    //       genreEpic: "%эпос%",
    //       genreMusic: "%муз%",
    //     });
    //   }
    // }
    // if (Array.isArray(genre) && genre.length > 0) {
    //   const genreConditions = genre.map(g => this.buildGenreCondition(g));
    //   query.andWhere(`(${genreConditions.join(" OR ")})`);
    // }

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

    if (typeof genre === "string") {
      if (genre === "Афоризмы") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genresAphorisms", {
          genresAphorisms: "%афоризмы%",
        });
      } else if (genre === "Басни") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genresFables", {
          genresFables: "%басни%",
        });
      } else if (genre === "Детективы") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreDetective", {
          genreDetective: "%детектив%",
        });
      } else if (genre === "Драматургия") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreDrama", {
          genreDrama: "%драма%",
        });
      } else if (genre === "Историческая проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreHistoric AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreProse: "%проза%",
          genreHistoric: "%истор%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Классическая проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreClassic AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreClassic: "%класс%",
          genreProse: "%проза%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Отечественный боевик") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreThriller OR LOWER(bookDetails.genre) LIKE :genreAction", {
          genreThriller: "%триллер%",
          genreAction: "%боевик%",
        });
      } else if (genre === "Поэзия") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genrePoetry", {
          genrePoetry: "%поэзия%",
        });
      } else if (genre === "Приключения") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreJourney", {
          genreJourney: "%приключ%",
        });
      } else if (genre === "Сентиментальная проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreSentimental AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreSentimental: "%сентимиент%",
          genreProse: "%проза%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Современная проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreModern AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreModern: "%совр%",
          genreProse: "%проза%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Фантастика") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreFantastic", {
          genreFantastic: "%фантаст%",
        });
      } else if (genre === "Фэнтези") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreFantasy OR LOWER(bookDetails.genre) LIKE :genreNovel", {
          genreFantasy: "%фэнтези%",
          genreNovel: "%новел%",
        });
      } else if (genre === "Эпос и фольклор") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreEpic OR LOWER(bookDetails.genre) LIKE :genreMusic", {
          genreEpic: "%эпос%",
          genreMusic: "%муз%",
        });
      }
    }
    if (Array.isArray(genre) && genre.length > 0) {
      const genreConditions = genre.map(g => this.buildGenreCondition(g));
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

    if (typeof genre === "string") {
      if (genre === "Афоризмы") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genresAphorisms", {
          genresAphorisms: "%афоризмы%",
        });
      } else if (genre === "Басни") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genresFables", {
          genresFables: "%басни%",
        });
      } else if (genre === "Детективы") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreDetective", {
          genreDetective: "%детектив%",
        });
      } else if (genre === "Драматургия") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreDrama", {
          genreDrama: "%драма%",
        });
      } else if (genre === "Историческая проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreHistoric AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreProse: "%проза%",
          genreHistoric: "%истор%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Классическая проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreClassic AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreClassic: "%класс%",
          genreProse: "%проза%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Отечественный боевик") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreThriller OR LOWER(bookDetails.genre) LIKE :genreAction", {
          genreThriller: "%триллер%",
          genreAction: "%боевик%",
        });
      } else if (genre === "Поэзия") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genrePoetry", {
          genrePoetry: "%поэзия%",
        });
      } else if (genre === "Приключения") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreJourney", {
          genreJourney: "%приключ%",
        });
      } else if (genre === "Сентиментальная проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreSentimental AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreSentimental: "%сентимиент%",
          genreProse: "%проза%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Современная проза") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreModern AND (LOWER(bookDetails.genre) LIKE :genreProse OR LOWER(bookDetails.genre) LIKE :genreRomance)", {
          genreModern: "%совр%",
          genreProse: "%проза%",
          genreRomance: "%роман%",
        });
      } else if (genre === "Фантастика") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreFantastic", {
          genreFantastic: "%фантаст%",
        });
      } else if (genre === "Фэнтези") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreFantasy OR LOWER(bookDetails.genre) LIKE :genreNovel", {
          genreFantasy: "%фэнтези%",
          genreNovel: "%новел%",
        });
      } else if (genre === "Эпос и фольклор") {
        query.andWhere("LOWER(bookDetails.genre) LIKE :genreEpic OR LOWER(bookDetails.genre) LIKE :genreMusic", {
          genreEpic: "%эпос%",
          genreMusic: "%муз%",
        });
      }
    }
    if (Array.isArray(genre) && genre.length > 0) {
      const genreConditions = genre.map(g => this.buildGenreCondition(g));
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
