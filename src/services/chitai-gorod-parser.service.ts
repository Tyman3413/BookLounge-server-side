import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Books } from "../entities/books.entity";
import { Repository } from "typeorm";
import { BookDetails } from "../entities/book-details.entity";
import axios from "axios";
import * as cheerio from "cheerio";
import { Logger } from "./logger.service";

@Injectable()
export class ChitaiGorodParserService {
  constructor(
    private readonly logger: Logger,

    @InjectRepository(Books)
    private readonly bookRepository: Repository<Books>,

    @InjectRepository(BookDetails)
    private readonly bookDetailsRepository: Repository<BookDetails>,
  ) {}

  async parseChitaiGorodBook(): Promise<Books[]> {
    const books: Books[] = [];
    const maxPages = 20; // await this.parseMaxPages();

    for (let page = 1; page <= maxPages; page++) {
      const response = await axios.get(`https://www.chitai-gorod.ru/catalog/books/hudozhestvennaya-literatura-110001?page=${page}`);
      this.logger.log(`Parsing page ${page}...`, ChitaiGorodParserService.name);

      if (response.status === 200) {
        const $ = cheerio.load(response.data);

        for (let index = 0; index < $("section.catalog-list .products-list article.product-card").length; index++) {
          const element = $("section.catalog-list .products-list article.product-card").eq(index);

          const title = $(element).attr("data-chg-product-name");

          const priceElement = $(element).attr("data-chg-product-price");
          const price = parseInt(priceElement, 10);

          const old_priceElement = $(element).attr("data-chg-product-old-price");
          let old_price = parseInt(old_priceElement, 10);

          if (old_price === price) {
            old_price = null;
          }

          const bookUrl = $(element).find("a.product-card__title").attr("href");

          const source = "Читай-город";

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

            books.push(newBook);
          } else {
            existingBook.title = title;
            existingBook.updated_at = new Date();
            await this.bookRepository.save(existingBook);

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
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    this.logger.log(`Parsing ended successfully`, ChitaiGorodParserService.name);

    return books;
  }

  async parseMaxPages(): Promise<number> {
    const response = await axios.get("https://www.chitai-gorod.ru/catalog/books/hudozhestvennaya-literatura-110001");
    if (response.status === 200) {
      const $ = cheerio.load(response.data);

      const paginationElement = $(".pagination .pagination__wrapper .pagination__button:not(.pagination__button--icon)").last();
      const pageElement = paginationElement.find("span.pagination__text").text().trim();

      return parseInt(pageElement, 10);
    }
    return 1;
  }

  async parseAdditionalInfoBook(bookId: number, bookUrl: string) {
    try {
      const response = await axios.get(bookUrl);

      if (response.status === 200) {
        const $ = cheerio.load(response.data);

        const authorElement = $(".product-detail-title__authors a");
        const author = authorElement.length
          ? Array.from(authorElement)
              .map(element => $(element).text().trim())
              .join(", ")
          : "";

        const image_coverElement = $(".product-gallery__picture img").attr("srcset");
        const image_cover = image_coverElement.split(" ")[0];

        const publisher = $('a.product-detail-characteristics__item-value[itemprop="publisher"]').text().trim();

        const series = $('.product-detail-characteristics__item-title:contains("Цикл")').next(".product-detail-characteristics__item-value").text().trim();

        const isbn = $('span.product-detail-characteristics__item-value[itemprop="isbn"]').text().trim();

        const weightElement = $('span.product-detail-characteristics__item-title:contains("Вес, г")').next("span.product-detail-characteristics__item-value").text().trim();
        const weight = parseInt(weightElement, 10);

        const size = $('span.product-detail-characteristics__item-title:contains("Размер")').next("span.product-detail-characteristics__item-value").text().trim();

        // const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // await page.goto(bookUrl);
        // await page.click(".product-detail-characteristics__toggle");
        // await page.waitForSelector('.product-detail-characteristics__item-title:contains("Возрастные ограничения")');
        // const age_restriction = $('span.product-detail-characteristics__item-value[itemprop="typicalAgeRange"]').text().trim();

        const genre = $("ul.product-detail-header__breadcrumbs li.breadcrumbs__item:last-child span").text().trim();

        const description = $(".product-detail-additional__description").text().trim();

        const yearElement = $('.product-detail-characteristics__item span[itemprop="datePublished"]').text().trim();
        const pub_year = parseInt(yearElement, 10);

        const pagesElement = $('span.product-detail-characteristics__item-value[itemprop="numberOfPages"]').text().trim();
        const pages = pagesElement ? parseInt(pagesElement, 10) : null;

        const book_idElement = $('.product-detail-characteristics__item-title:contains("ID товара")').next(".product-detail-characteristics__item-value").text().trim();
        const book_id = parseInt(book_idElement, 10);

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
          existingBookDetails.weight = weight || existingBookDetails.weight;
          existingBookDetails.size = size || existingBookDetails.size;
          existingBookDetails.isbn = isbn;
          existingBookDetails.age_restriction = existingBookDetails.age_restriction;
          existingBookDetails.description = description;
          existingBookDetails.genre = genre;
          existingBookDetails.pub_year = pub_year;
          existingBookDetails.pages = pages;
          existingBookDetails.source = source;
          await this.bookDetailsRepository.save(existingBookDetails);
        }
      }
    } catch (error) {
      console.error(`Error: ${error.message}`, ChitaiGorodParserService.name);
    }
  }
}
