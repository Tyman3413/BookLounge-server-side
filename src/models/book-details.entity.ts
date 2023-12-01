import {
  Column,
  Entity,
  JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Books } from './books.entity';

@Entity()
export class BookDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  image_cover: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  old_price: number;

  @Column({ nullable: true })
  publisher: string;

  @Column({ nullable: true })
  series: string;

  @Column({ nullable: true })
  pub_year: number;

  @Column({ nullable: true })
  isbn: string;

  @Column({ nullable: true, default: 384 })
  pages: number;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  circulation: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  age_restriction: string;

  @Column({ nullable: true })
  book_id: number;

  @Column({ nullable: true })
  id_book: number;

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Books, (books) => books.details)
  @JoinColumn({ name: 'id_book' })
  books: Books;
}
