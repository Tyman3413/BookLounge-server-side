import { Controller, Get, Query } from "@nestjs/common";
import { BookService } from "src/services/book.service";
import { Books } from "../entities/books.entity";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaginationQueryDto } from "src/dto/pagination.dto";

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
    name: "order",
    type: String,
    description: "Направление сортировки",
    required: false,
  })
  @ApiQuery({
    name: "genre",
    type: [String],
    isArray: true,
    description: "Жанры для фильтрации",
    required: false,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query("sort") sort: string = "id",
    @Query("order") order: "ASC" | "DESC" = "ASC",
    @Query("genre") genre: string[] = [],
  ): Promise<{ books: Books[]; totalCount: number }> {
    const { page, limit } = paginationQuery;
    const [books, totalCount] = await this.bookService.findAll(page, limit, sort, order, genre);
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
    name: "order",
    type: String,
    description: "Направление сортировки",
    required: false,
  })
  async findDiscountBooks(@Query() PaginationQuery: PaginationQueryDto): Promise<{ books: Books[]; totalCount: number }> {
    const { page, limit } = PaginationQuery;
    const [books, totalCount] = await this.bookService.findDiscountBooks(page, limit);
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
    required: true,
  })
  @ApiQuery({
    name: "limit",
    type: Number,
    description: "Количество элементов на странице",
    required: true,
  })
  async findNewBooks(@Query() PaginationQuery: PaginationQueryDto): Promise<{ books: Books[]; totalCount: number }> {
    const { page, limit } = PaginationQuery;
    const [books, totalCount] = await this.bookService.findNewBooks(page, limit);
    return { books, totalCount };
  }

  // TODO
  // @Get('genres')
  // async findGenres(@Query() )
}
