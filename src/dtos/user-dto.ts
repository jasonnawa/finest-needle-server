import { Gender } from "../enums/user-enums";

export interface CreateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  gender?: Gender;
  phoneNumber?: string;
  country?: string;
  address?: string;
  location?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  religion?: string;
  relationshipGoals?: string;
  password?: string;
  profileImage?: {
    data: Buffer,
    contentType: String,
  },
}

export interface RegisterUserDTO extends CreateUserDTO {
  preferenceCountry?: string;
  preferenceLocation?: string;
  preferenceLoveLanguage?: string;
  preferenceLifestyle?: string;
  preferenceType?: string;
}