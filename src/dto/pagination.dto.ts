import { IsNumber, IsOptional, IsPositive } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PaginationQueryDto {
  @ApiProperty({ description: "Номер страницы", required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;

  @ApiProperty({ description: "Количество элементов на странице", required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;
}
