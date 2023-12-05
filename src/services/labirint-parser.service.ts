import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import * as cheerio from "cheerio";
import { BookDetails } from "src/entities/book-details.entity";
import { Books } from "src/entities/books.entity";
import { Repository } from "typeorm";
import { Logger } from "./logger.service";

@Injectable()
export class LabirintBookParserService {
  constructor(
    private readonly logger: Logger,

    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,
  ) {}

  async parseLabirintBook(): Promise<Books[]> {
    const books: Books[] = [];
    const maxPages = await this.parseMaxPages();

    for (let page = 1; page <= maxPages; page++) {
      const responce = await axios.get(`https://www.labirint.ru/genres/1852/?page=${page}`);
      this.logger.log(`Parsing page ${page}...`, LabirintBookParserService.name);

      if (responce.status === 200) {
        const $ = cheerio.load(responce.data);

        // Парсинг с раздела "Все книги жанра"
        const promises = $(".genres-catalog .genres-carousel__item").map(async (index, element) => {
          const title = $(element).find(".product-title").text().trim();

          const book_id_element = $(element).find(".genres-carousel__item .product").attr("data-product-id").trim();
          const book_id = parseInt(book_id_element, 10);

          const priceELement = $(element).find(".genres-carousel__item .product").attr("data-discount-price");
          const price = parseInt(priceELement, 10);

          const old_priceElement = $(element).find(".genres-carousel__item .product").attr("data-price");
          let old_price = parseInt(old_priceElement, 10);

          if (old_price === price) {
            old_price = null;
          }

          const source = "Labirint";

          const existingBook = await this.bookRepository.findOne({
            where: { title },
          });

          if (!existingBook) {
            const newBook = new Books();
            newBook.title = title;
            newBook.updated_at = new Date();
            await this.bookRepository.save(newBook);
            const newBookDetails = new BookDetails();
            newBookDetails.id_book = newBook.id;
            newBookDetails.source = source;
            if (price !== null && !isNaN(price)) {
              newBookDetails.price = price;
            } else {
              newBookDetails.price = null;
            }
            if (old_price !== null && !isNaN(old_price)) {
              newBookDetails.old_price = old_price;
            } else {
              newBookDetails.old_price = null;
            }
            await this.bookDetailsRepository.save(newBookDetails);

            await this.parseAdditionalInfoBook(newBook.id, `https://www.labirint.ru/books/${book_id}`);

            return this.bookRepository.save(newBook);
          } else {
            existingBook.title = title;
            existingBook.updated_at = new Date();
            await this.bookRepository.save(existingBook);
            const newBookDetails = await this.bookDetailsRepository.findOne({
              where: { id_book: existingBook.id, source: source },
            });
            if (price !== null && !isNaN(price)) {
              newBookDetails.price = price;
            } else {
              newBookDetails.price = null;
            }
            if (old_price !== null && !isNaN(old_price)) {
              newBookDetails.old_price = old_price;
            } else {
              newBookDetails.old_price = null;
            }
            await this.bookDetailsRepository.save(newBookDetails);

            await this.parseAdditionalInfoBook(existingBook.id, `https://www.labirint.ru/books/${book_id}`);
          }
        });

        await Promise.all(promises);
      }
    }
    this.logger.log("Parsing ended successfully", LabirintBookParserService.name);
    return books;
  }

  async parseMaxPages(): Promise<number> {
    const response = await axios.get("https://www.labirint.ru/genres/1852/");
    if (response.status === 200) {
      const $ = cheerio.load(response.data);

      const paginationRightElement = $(".pagination-number__right");
      const pageNumberElement = paginationRightElement.find("a.pagination-number__text");
      const maxPagesText = pageNumberElement.eq(-1).text(); // Выбирает последний элемент
      return parseInt(maxPagesText, 10);
    }
    return 1;
  }

  async parseAdditionalInfoBook(bookId: number, bookURL: string) {
    try {
      const responce = await axios.get(bookURL);

      if (responce.status === 200) {
        const $ = cheerio.load(responce.data);

        const authorElement = $(".authors a");
        const author = authorElement.length
          ? Array.from(authorElement)
              .map(element => $(element).text().trim())
              .join(", ")
          : "";

        const image_cover = $("#product-image img").attr("data-src");

        const publisher = $(".publisher a").text().trim();

        const series = $(".series a").text().trim();

        const isbnText = $(".isbn").text();
        const matches = isbnText.match(/\b\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-\d{1,9}\b/);

        const isbn = matches ? matches[0] : null;

        const weight_text = $(".weight").text().replace("Масса: ", "").replace(" г", "").trim();
        const weight = parseInt(weight_text, 10);

        const size = $(".dimensions").text().replace("Размеры: ", "").replace(" мм", "").trim();

        const age_restriction = $("#age_dopusk").text().trim();

        const genre = $("#product-left-column #product-info").attr("data-maingenre-name");

        const description = $("#product-about p").text().trim();

        const year_text = $(".publisher").text().match(/\d{4}/);
        const pub_year_int = year_text ? parseInt(year_text[0], 10) : null;

        const pages_element = $(".pages2").text().trim().match(/\d+/);
        const pages_int = pages_element ? parseInt(pages_element[0], 10) : null;

        const book_idElement = $(".articul").text().replace(/\D/g, "");
        const book_id = parseInt(book_idElement, 10);

        const circulation = ""; // Установите значение, если у вас есть информация о тираже

        const source = "Labirint";

        const existingBookDetails = await this.bookDetailsRepository.findOne({
          where: { id_book: bookId, source: source },
        });

        if (existingBookDetails) {
          existingBookDetails.book_id = !isNaN(book_id) ? book_id : null;
          existingBookDetails.author = author;
          existingBookDetails.image_cover = image_cover;
          existingBookDetails.publisher = publisher;
          existingBookDetails.series = series;
          existingBookDetails.weight = weight || existingBookDetails.weight;
          existingBookDetails.size = size || existingBookDetails.size;
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
      this.logger.error(`Error: ${error.message}`, LabirintBookParserService.name);
    }
  }
}
