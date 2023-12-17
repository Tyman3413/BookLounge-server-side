import { Controller, Get, Query } from "@nestjs/common";
import { BookService } from "src/services/book.service";
import { Books } from "../entities/books.entity";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaginationQueryDto } from "src/dto/pagination.dto";
import { Genres } from "../entities/genres.entity";

@Controller("get-books")
@ApiTags("Books")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get("all")
  @ApiOperation({
    summary: "Получить все книги из базы данных",
    description: "После обработки запроса выводится вся информация о книгах, включая дополнительную информацию. Ограничений нет",
  })
  @ApiResponse({ status: 200, description: "Успешный запрос", type: [Books] })
  @ApiQuery({
    name: "page",
    type: Number,
    description: "Номер страницы",
    required: false,
  })
  @ApiQuery({
    name: "limit",
    type: Number,
    description: "Количество элементов на странице",
    required: false,
  })
  @ApiQuery({
    name: "sort",
    type: String,
    description: "Поле сортировки",
    required: false,
  })
  @ApiQuery({
    name: "genres",
    type: [String],
    description: "Жанры для фильтрации",
    required: false,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query("sort") sort: string = "id",
    @Query("genres") genres: string | string[],
  ): Promise<{ books: Books[]; totalCount: number }> {
    const { page, limit } = paginationQuery;
    const [books, totalCount] = await this.bookService.findAll(page, limit, sort, genres);
    return { books, totalCount };
  }

  @Get("discount")
  @ApiOperation({
    summary: "Получить книги по скидке (значение old_price != null)",
  })
  @ApiResponse({ status: 200, description: "Успешный запрос", type: [Books] })
  @ApiQuery({
    name: "page",
    type: Number,
    description: "Номер страницы",
    required: true,
  })
  @ApiQuery({
    name: "limit",
    type: Number,
    description: "Количество элементов на странице",
    required: true,
  })
  @ApiQuery({
    name: "sort",
    type: String,
    description: "Поле сортировки",
    required: false,
  })
  @ApiQuery({
    name: "genre",
    type: String,
    description: "Жанры для фильтрации",
    required: false,
  })
  async findDiscountBooks(
    @Query() paginationQuery: PaginationQueryDto,
    @Query("sort") sort: string = "id",
    @Query("genre") genre: string,
  ): Promise<{ books: Books[]; totalCount: number }> {
    const { page, limit } = paginationQuery;
    const [books, totalCount] = await this.bookService.findDiscountBooks(page, limit, sort, genre);
    return { books, totalCount };
  }

  @Get("new")
  @ApiOperation({
    summary: "Получить новинки книг",
  })
  @ApiResponse({ status: 200, description: "Успешный запрос", type: [Books] })
  @ApiQuery({
    name: "page",
    type: Number,
    description: "Номер страницы",
    required: false,
  })
  @ApiQuery({
    name: "limit",
    type: Number,
    description: "Количество элементов на странице",
    required: false,
  })
  @ApiQuery({
    name: "sort",
    type: String,
    description: "Поле сортировки",
    required: false,
  })
  @ApiQuery({
    name: "genre",
    type: String,
    description: "Жанры для фильтрации",
    required: false,
  })
  async findNewBooks(
    @Query() PaginationQuery: PaginationQueryDto,
    @Query("sort") sort: string = "id",
    @Query("genre") genre: string,
  ): Promise<{ books: Books[]; totalCount: number }> {
    const { page, limit } = PaginationQuery;
    const [books, totalCount] = await this.bookService.findNewBooks(page, limit, sort, genre);
    return { books, totalCount };
  }

  @Get("genres")
  @ApiOperation({
    summary: "Получить список жанров",
  })
  @ApiResponse({ status: 200, description: "Успешный запрос", type: [Genres] })
  async findGenres(): Promise<Genres[]> {
    return await this.bookService.findGenres();
  }
}
