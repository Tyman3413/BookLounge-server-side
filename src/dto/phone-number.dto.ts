import { IsPhoneNumber, IsString } from 'class-validator';

export class SendPhoneNumberDto {
  @IsString()
  @IsPhoneNumber('RU')
  phone_number: string;
}
