import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Books } from "./books.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class BookDetails {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "Уникальный идентификатор деталей книги" })
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Источник, из которого была взята книга" })
  source: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Автор книги" })
  author: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Обложка книги" })
  image_cover: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Текущая цена книги" })
  price: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Цена книги без скидки" })
  old_price: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Издательство" })
  publisher: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Серия книг" })
  series: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Год издательства книги" })
  pub_year: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "ISBN книги" })
  isbn: string;

  @Column({ nullable: true, default: 384 })
  @ApiProperty({ description: "Количество страниц книги" })
  pages: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Размеры книги" })
  size: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Цикл книг" })
  circulation: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Вес книги" })
  weight: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Возрастные ограничения книги" })
  age_restriction: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Уникальный идентификатор книги из источника" })
  book_id: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Внешний ключ для книги" })
  id_book: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Жанр книги" })
  genre: string;

  @Column({ nullable: true })
  @ApiProperty({ description: "Описание книги" })
  description: string;

  @ManyToOne(() => Books, books => books.details)
  @JoinColumn({ name: "id_book" })
  books: Books;
}
