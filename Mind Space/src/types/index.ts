export interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  profile_picture: string | null;
  bio: string | null;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user?: User;
}

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
  user?: User;
}

export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  created_by: number;
  member_count: number;
  created_at: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  created_at: string;
}

export interface GroupMessage {
  id: number;
  group_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: User;
}

// NextAuth types extension
declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    name?: string;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      name?: string;
      email: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
  }
}