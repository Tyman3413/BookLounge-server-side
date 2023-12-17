import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Genres } from "../entities/genres.entity";
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class GenresParserService {
  constructor(
    @InjectRepository(Genres)
    private readonly genresRepository: Repository<Genres>,
  ) {}

  async parseGenres(): Promise<Genres[]> {
    const genres: Genres[] = [];
    const response = await axios.get(`https://www.labirint.ru/genres/1852/`);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      $(".subgenres ul.genre-list-all li").each((index, element) => {
        const title = $(element).find("a").text();
        if (title.length !== 0 && title !== "Главные книги отдела") {
          const newGenres = new Genres();
          newGenres.title = title;
          genres.push(newGenres);
        }
      });
      await this.genresRepository.save(genres);
    }
    return genres;
  }
}
