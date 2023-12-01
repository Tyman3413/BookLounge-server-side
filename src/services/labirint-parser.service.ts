import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { BookDetails } from 'src/models/book-details.entity';
import { Books } from 'src/models/books.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LabirintBookParserService {
  constructor(
    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,
  ) {}
  async parseLabirintBook(): Promise<Books[]> {
    const books: Books[] = [];
    const maxPages = 500;

    for (let page = 1; page <= maxPages; page++) {
      const responce = await axios.get(
        `https://www.labirint.ru/genres/1852/?page=${page}`,
      );
      console.log(`Parsing page ${page}...`);

      if (responce.status === 200) {
        const $ = cheerio.load(responce.data);

        // Парсинг с раздела "Все книги жанра"
        const promises = $('.genres-catalog .genres-carousel__item').map(
          async (index, element) => {
            const title = $(element).find('.product-title').text().trim();

            const book_id_element = $(element)
              .find('.genres-carousel__item .product')
              .attr('data-product-id')
              .trim();
            const book_id = parseInt(book_id_element, 10);

            const priceELement = $(element)
              .find('.genres-carousel__item .product')
              .attr('data-discount-price')
              .trim();
            const price = parseInt(priceELement, 10);

            const old_priceElement = $(element)
              .find('.genres-carousel__item .product')
              .attr('data-price')
              .trim();
            const old_price_int = parseInt(old_priceElement, 10);

            const source = 'Labirint';

            const existingBook = await this.bookRepository.findOne({
              where: { title },
            });

            if (!existingBook) {
              const newBook = new Books();
              newBook.title = title;
              await this.bookRepository.save(newBook);
              const newBookDetails = new BookDetails();
              newBookDetails.id_book = newBook.id;
              newBookDetails.source = source;
              if (!isNaN(price)) {
                newBookDetails.price = price;
              } else {
                newBookDetails.price = null;
              }
              if (!isNaN(old_price_int)) {
                newBookDetails.old_price = old_price_int;
              } else {
                newBookDetails.old_price = null;
              }
              await this.bookDetailsRepository.save(newBookDetails);

              await this.parseAdditionalInfoBook(
                newBook.id,
                `https://www.labirint.ru/books/${book_id}`,
              );

              return this.bookRepository.save(newBook);
            } else {
              existingBook.title = title;
              await this.bookRepository.save(existingBook);
              const newBookDetails = await this.bookDetailsRepository.findOne({
                where: { id_book: existingBook.id, source: source },
              });
              if (!isNaN(price)) {
                newBookDetails.price = price;
              } else {
                newBookDetails.price = null;
              }
              if (!isNaN(old_price_int)) {
                newBookDetails.old_price = old_price_int;
              } else {
                newBookDetails.old_price = null;
              }
              await this.bookDetailsRepository.save(newBookDetails);

              await this.parseAdditionalInfoBook(
                existingBook.id,
                `https://www.labirint.ru/books/${book_id}`,
              );
            }
          },
        );

        await Promise.all(promises);
      }
    }
    console.log('Parsing ended successfully');
    return books;
  }

  async parseMaxPages(): Promise<number> {
      const response = await axios.get('https://www.labirint.ru/genres/1852/');
      if (response.status === 200) {
        const $ = cheerio.load(response.data);

        const paginationRightElement = $('.pagination-number__right');
        const pageNumberElement = paginationRightElement.find(
            'a.pagination-number__text',
        );
        const maxPagesText = pageNumberElement.eq(-1).text(); // Выбирает последний элемент
        const maxPages = parseInt(maxPagesText, 10);

        return maxPages;
      }
      return 1;
  }

  async parseAdditionalInfoBook(bookId: number, bookURL: string) {
    try {
      const responce = await axios.get(bookURL);

      if (responce.status === 200) {
        const $ = cheerio.load(responce.data);

        const authorElement = $('.authors a');
        const author = authorElement.length
          ? authorElement.text().trim()
          : 'не указан';

        const image_cover = $('#product-image img').attr('data-src');

        const publisher = $('.publisher a').text().trim();

        const series = $('.series a').text().trim();

        const isbn = $('.isbn').text().replace('ISBN: ', '').trim();

        const weight_text = $('.weight')
          .text()
          .replace('Масса: ', '')
          .replace(' г', '')
          .trim();
        const weightInt = parseInt(weight_text, 10);

        const size = $('.dimensions')
          .text()
          .replace('Размеры: ', '')
          .replace(' мм', '')
          .trim();

        const age_restriction = $('#age_dopusk').text().trim();

        const genre = $('.genre a').text().trim();

        const description = $('#product-about p').text().trim();

        const year_text = $('.publisher').text().match(/\d{4}/);
        const pub_year_int = year_text ? parseInt(year_text[0], 10) : null;

        const pages_element = $('.pages2').text().trim().match(/\d+/);
        const pages_int = pages_element ? parseInt(pages_element[0], 10) : null;

        const book_idElement = $('.articul').text().replace(/\D/g, '');
        const book_id = parseInt(book_idElement, 10);

        const circulation = ''; // Установите значение, если у вас есть информация о тираже

        const source = 'Labirint';

        const existingBookDetails = await this.bookDetailsRepository.findOne({
          where: { id_book: bookId, source: source },
        });

        if (existingBookDetails) {
          existingBookDetails.book_id = !isNaN(book_id) ? book_id : null;
          existingBookDetails.author = author;
          existingBookDetails.image_cover = image_cover;
          existingBookDetails.publisher = publisher;
          existingBookDetails.series = series;
          existingBookDetails.circulation = circulation; // Установите значение, если у вас есть информация о тираже
          existingBookDetails.weight = !isNaN(weightInt) ? weightInt : null;
          existingBookDetails.size = size;
          existingBookDetails.isbn = isbn;
          existingBookDetails.age_restriction = age_restriction;
          existingBookDetails.description = description;
          existingBookDetails.genre = genre;
          existingBookDetails.pub_year = pub_year_int;
          existingBookDetails.pages = pages_int;
          existingBookDetails.source = source;
          await this.bookDetailsRepository.save(existingBookDetails);
        }
      }
    } catch (error) {
      console.error('Error: ', error.message);
    }
  }
}
