export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  directorName?: string;
  directorTitle?: string;
  createdAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string | null;
  tags: any;
  price: number | null;
  credit: number | null;
  hours: number | null;
  instructorId: string | null;
  siteNumber: number;
  createdAt: string;
  updatedAt: string;
  instructor?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
