import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BookmarksService } from "../services/bookmarks.service";
import { Bookmarks } from "../entities/bookmarks.entity";

@Controller("bookmarks")
@ApiTags("Bookmarks")
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(":userId/:bookId")
  @ApiOperation({
    summary: "Создание новой загладки для определенного пользователя",
  })
  @ApiResponse({ status: 200, description: "Успешный запрос", type: [Bookmarks] })
  @ApiParam({
    name: "userId",
    type: Number,
    description: "ID пользователя",
    required: true,
  })
  @ApiParam({
    name: "bookId",
    type: Number,
    description: "ID книги",
    required: true,
  })
  async createBookmark(@Param("userId") userId: number, @Param("bookId") bookId: number): Promise<Bookmarks> {
    return this.bookmarksService.createBookmark(userId, bookId);
  }

  @Get(":userId")
  @ApiOperation({
    summary: "Получить список загладок для определенного пользователя",
  })
  @ApiResponse({ status: 200, description: "Успешный запрос", type: [Bookmarks] })
  @ApiParam({
    name: "userId",
    type: Number,
    description: "ID пользователя",
    required: true,
  })
  async getBookmarks(@Param("userId") userId: number): Promise<Bookmarks[]> {
    return this.bookmarksService.getBookmarks(userId);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Удалить загладку для определенного пользователя",
  })
  @ApiResponse({ status: 200, description: "Успешный запрос", type: [Bookmarks] })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID загладки",
    required: true,
  })
  async deleteBookmark(@Param("id") id: number): Promise<Bookmarks> {
    return this.bookmarksService.deleteBookmark(id);
  }
}
