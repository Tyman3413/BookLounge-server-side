import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Books } from "./books.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Bookmarks {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "Уникальный идентификатор закладки" })
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Внешний ключ для связи пользователей с закладками" })
  userId: number;

  @Column({ nullable: true })
  @ApiProperty({ description: "Внешний ключ для связи книг с закладками" })
  bookId: number;

  @CreateDateColumn()
  @ApiProperty({ description: "Дата создания записи о закладке" })
  created_at: Date;

  @ManyToOne(() => Books)
  @JoinColumn({ name: "bookId" })
  book: Books;

  @ManyToOne(() => User, user => user.bookmarks)
  @JoinColumn({ name: "userId" })
  user: User;
}
