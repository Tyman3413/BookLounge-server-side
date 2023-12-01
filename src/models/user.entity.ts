import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number; // id пользователя

  @Column({ unique: true })
  phone_number: string; // уникальный номер телефона

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ default: false })
  isLocked: boolean;
}
