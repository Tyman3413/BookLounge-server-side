import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from "typeorm";
import { BookDetails } from "./book-details.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Books {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "Уникальный идентификатор книги" })
  id: number;

  @Column({ default: "" })
  @ApiProperty({ description: "Название книги" })
  title: string;

  @CreateDateColumn()
  @ApiProperty({ description: "Дата создания записи о книге" })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: "Дата последнего обновления записи о книге" })
  updated_at: Date;

  @OneToMany(() => BookDetails, details => details.books)
  @JoinColumn()
  @ApiProperty({ type: () => BookDetails, isArray: true, description: "Детали книги" })
  details: BookDetails;
}
