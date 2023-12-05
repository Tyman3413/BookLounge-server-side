import { Controller, Get } from "@nestjs/common";
import { LabirintBookParserService } from "src/services/labirint-parser.service";
import { Books } from "../entities/books.entity";
import { ChitaiGorodParserService } from "../services/chitai-gorod-parser.service";
import { ApiTags } from "@nestjs/swagger";

@Controller("parse-books")
@ApiTags("Parsing")
export class ParseBookController {
  constructor(
    private readonly labirintBookParserService: LabirintBookParserService,
    private readonly chitaiGorodBookParserService: ChitaiGorodParserService,
  ) {}

  @Get("labirint")
  async parseFromLabirint(): Promise<Books[]> {
    return await this.labirintBookParserService.parseLabirintBook();
  }

  @Get("chitai-gorod")
  async parseFromChitaiGorod(): Promise<Books[]> {
    return await this.chitaiGorodBookParserService.parseChitaiGorodBook();
  }
}
