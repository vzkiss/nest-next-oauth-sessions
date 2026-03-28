/**
 * Public user shape returned by the API (e.g. GET/PUT /user/profile).
 * Matches the serialized User entity with sensitive fields excluded.
 */
export class UserDto {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}
