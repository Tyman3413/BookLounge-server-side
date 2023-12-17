import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Genres {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "Уникальный идентификатор жанра" })
  id: number;

  @Column({ default: "" })
  @ApiProperty({ description: "Название жанра" })
  title: string;
}
