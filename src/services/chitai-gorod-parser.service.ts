import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Books } from "../models/books.entity";
import { Repository } from "typeorm";
import { BookDetails } from "../models/book-details.entity";
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class ChitaiGorodParserService {
  constructor(
    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,
  ) {}

  async parseChitaiGorodBook(): Promise<Books[]> {
    const books: Books[] = [];
    const maxPages = await this.parseMaxPages(); // TEST

    for (let page = 1; page <= maxPages; page++) {
      const responce = await axios.get(`https://www.chitai-gorod.ru/catalog/books/hudozhestvennaya-literatura-110001?page=${page}`);
      console.log(`Parsing page ${page}...`);

      if (responce.status === 200) {
        const $ = cheerio.load(responce.data);

        const promises = $(".products-list .product-card").map(async (index, element) => {
          const title = $(element).find(".product-title__head").text().trim();

          const priceElement = $(element).find(".product-price__value").text().trim();
          const price = parseInt(priceElement, 10);

          const old_priceElement = $(element).find(".product-price__old").text().trim();
          const old_price = parseInt(old_priceElement, 10);

          const bookUrl = $(element).find("a.product-card__title").attr("href");

          const source = "Читай-город";

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
            if (!isNaN(old_price)) {
              newBookDetails.old_price = old_price;
            } else {
              newBookDetails.old_price = null;
            }

            await this.bookDetailsRepository.save(newBookDetails);

            await this.parseAdditionalInfoBook(newBook.id, `https://www.chitai-gorod.ru${bookUrl}`);

            return this.bookRepository.save(newBook);
          } else {
            existingBook.title = title;
            const existingBookDetails = await this.bookDetailsRepository.findOne({
              where: { id_book: existingBook.id, source: source },
            });
            if (!existingBookDetails) {
              const newBookDetails = new BookDetails();
              newBookDetails.id_book = existingBook.id;
              newBookDetails.source = source;
              if (!isNaN(price)) {
                newBookDetails.price = price;
              } else {
                newBookDetails.price = null;
              }
              if (!isNaN(old_price)) {
                newBookDetails.old_price = old_price;
              } else {
                newBookDetails.old_price = null;
              }
              await this.bookDetailsRepository.save(newBookDetails);

              await this.parseAdditionalInfoBook(existingBook.id, `https://www.chitai-gorod.ru${bookUrl}`);
            } else {
              if (!isNaN(price)) {
                existingBookDetails.price = price;
              } else {
                existingBookDetails.price = null;
              }
              if (!isNaN(old_price)) {
                existingBookDetails.old_price = old_price;
              } else {
                existingBookDetails.old_price = null;
              }
              await this.bookDetailsRepository.save(existingBookDetails);

              await this.parseAdditionalInfoBook(existingBook.id, `https://www.chitai-gorod.ru${bookUrl}`);
            }
            return this.bookRepository.save(existingBook);
          }
        });
        await Promise.all(promises);
      }
    }
    console.log(`Parsing ended successfully`);
    return books;
  }

  async parseMaxPages(): Promise<number> {
    try {
      const responce = await axios.get("https://www.chitai-gorod.ru/catalog/books/hudozhestvennaya-literatura-110001");
      if (responce.status === 200) {
        const $ = cheerio.load(responce.data);

        const pagintationElement = $(".pagination .pagination__wrapper .pagination__button .pagination__text span").last().text().trim();
        return parseInt(pagintationElement, 10);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async parseAdditionalInfoBook(bookId: number, bookUrl: string) {
    try {
      const responce = await axios.get(bookUrl);

      if (responce.status === 200) {
        const $ = cheerio.load(responce.data);

        const authorElement = $(".product-detail-title__authors a");
        const author = authorElement.length ? authorElement.text().trim() : "не указан";

        const image_cover = $(".product-gallery__picture img").attr("srcset");

        const publisher = $('a.product-detail-characteristics__item-value[itemprop="publisher"]').text().trim();

        const series = $('.product-detail-characteristics__item-title:contains("Цикл")').next(".product-detail-characteristics__item-value").text().trim();

        const isbn = $('span.product-detail-characteristics__item-value[itemprop="isbn"]').text().trim();

        const weightElement = $('span.product-detail-characteristics__item-title:contains("Вес, г")').next("span.product-detail-characteristics__item-value").text().trim();
        const weight = parseInt(weightElement, 10);

        const size = $('span.product-detail-characteristics__item-title:contains("Размер")').next("span.product-detail-characteristics__item-value").text().trim();

        const age_restriction = "";

        const genre = $("ul.product-detail-header__breadcrumbs li.breadcrumbs__item a span").text().trim();

        const description = $(".product-detail-additional__description").text().trim();

        const yearElement = $('.product-detail-characteristics__item span[itemprop="datePublished"]').text().trim();
        const pub_year = parseInt(yearElement, 10);

        const pagesElement = $('span.product-detail-characteristics__item-value[itemprop="numberOfPages"]').text().trim();
        const pages = pagesElement ? parseInt(pagesElement, 10) : null;

        const book_idElement = $('.product-detail-characteristics__item-title:contains("ID товара")').next(".product-detail-characteristics__item-value").text().trim();
        const book_id = parseInt(book_idElement, 10);

        const circulation = $('.product-detail-characteristics__item-title:contains("Серия")').next(".product-detail-characteristics__item-value").text().trim();

        const source = "Читай-город";

        const existingBookDetails = await this.bookDetailsRepository.findOne({
          where: { id_book: bookId, source: source },
        });

        if (existingBookDetails) {
          existingBookDetails.book_id = !isNaN(book_id) ? book_id : null;
          existingBookDetails.author = author;
          existingBookDetails.image_cover = image_cover;
          existingBookDetails.publisher = publisher;
          existingBookDetails.series = series;
          existingBookDetails.circulation = circulation;
          existingBookDetails.weight = !isNaN(weight) ? weight : null;
          existingBookDetails.size = size;
          existingBookDetails.isbn = isbn;
          existingBookDetails.age_restriction = age_restriction;
          existingBookDetails.description = description;
          existingBookDetails.genre = genre;
          existingBookDetails.pub_year = pub_year;
          existingBookDetails.pages = pages;
          existingBookDetails.source = source;
          await this.bookDetailsRepository.save(existingBookDetails);
        }
      }
    } catch (error) {
      console.error("Error: ", error.message);
    }
  }
}
