import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Bookmarks } from "./bookmarks.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number; // id пользователя

  @Column({ unique: true })
  phone_number: string; // уникальный номер телефона

  @OneToMany(() => Bookmarks, bookmarks => bookmarks.user)
  bookmarks: Bookmarks[];

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ default: false })
  isLocked: boolean;
}
