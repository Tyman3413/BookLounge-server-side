import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Books } from 'src/models/books.entity';
import { Repository } from 'typeorm';
import {BookDetails} from "../models/book-details.entity";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,
  ) {}

  async findAll(page: number, limit: number): Promise<Books[]> {
    return this.bookRepository.createQueryBuilder('books')
        .leftJoinAndSelect('books.details', 'bookDetails')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
  }

  async findDiscountBooks(page: number, limit: number): Promise<Books[]> {
    return this.bookRepository.createQueryBuilder('books')
        .leftJoinAndSelect('books.details', 'bookDetails')
        .where('bookDetails.old_price IS NOT NULL')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
  }
}
