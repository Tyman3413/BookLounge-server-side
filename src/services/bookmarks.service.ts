import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bookmarks } from "../entities/bookmarks.entity";
import { Repository } from "typeorm";

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmarks)
    private bookmarksRepository: Repository<Bookmarks>,
  ) {}

  async createBookmark(userId: number, bookId: number): Promise<Bookmarks> {
    const bookmark = this.bookmarksRepository.create({ userId, bookId });
    return await this.bookmarksRepository.save(bookmark);
  }

  async getBookmarks(userId: number): Promise<Bookmarks[]> {
    return await this.bookmarksRepository.find({ where: { userId } });
  }

  async deleteBookmark(bookmarkId: number): Promise<Bookmarks> {
    const bookmark = await this.bookmarksRepository.findOne({ where: { id: bookmarkId } });
    if (!bookmark) {
      throw new NotFoundException("Bookmark not found");
    }
    return await this.bookmarksRepository.remove(bookmark);
  }
}
