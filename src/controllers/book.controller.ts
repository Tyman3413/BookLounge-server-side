import { Controller, Get, Query } from '@nestjs/common';
import { BookService } from 'src/services/book.service';
import { Books } from '../models/books.entity';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/dto/pagination.dto';

@Controller('get-books')
@ApiTags('Books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('all')
  @ApiOperation({ summary: 'Получить все книги из базы данных' })
  @ApiResponse({ status: 200, description: 'Успешный запрос', type: [Books] })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Номер страницы',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Количество элементов на странице',
    required: false,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<Books[]> {
    const { page, limit } = paginationQuery;
    return this.bookService.findAll(page, limit);
  }

  @Get('discount')
  @ApiOperation({
    summary: 'Получить книги по скидке (значение old_price != null)',
  })
  @ApiResponse({ status: 200, description: 'Успешный запрос', type: [Books] })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Номер страницы',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Количество элементов на странице',
    required: false,
  })
  async findDiscountBooks(
    @Query() PaginationQuery: PaginationQueryDto,
  ): Promise<Books[]> {
    const { page, limit } = PaginationQuery;
    return this.bookService.findDiscountBooks(page, limit);
  }
}
