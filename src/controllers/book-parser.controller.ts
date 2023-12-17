import { Controller, Get } from "@nestjs/common";
import { LabirintBookParserService } from "src/services/labirint-parser.service";
import { Books } from "../entities/books.entity";
import { ChitaiGorodParserService } from "../services/chitai-gorod-parser.service";
import { ApiTags } from "@nestjs/swagger";
import { GenresParserService } from "../services/genres-parser.service";
import { Genres } from "../entities/genres.entity";

@Controller("parse-books")
@ApiTags("Parsing")
export class ParseBookController {
  constructor(
    private readonly labirintBookParserService: LabirintBookParserService,
    private readonly chitaiGorodBookParserService: ChitaiGorodParserService,
    private readonly genresParserService: GenresParserService,
  ) {}

  @Get("labirint")
  async parseFromLabirint(): Promise<Books[]> {
    return await this.labirintBookParserService.parseLabirintBook();
  }

  @Get("genres")
  async parseGenres(): Promise<Genres[]> {
    return await this.genresParserService.parseGenres();
  }

  @Get("chitai-gorod")
  async parseFromChitaiGorod(): Promise<Books[]> {
    return await this.chitaiGorodBookParserService.parseChitaiGorodBook();
  }
}
