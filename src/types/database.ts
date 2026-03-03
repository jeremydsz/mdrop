export type User = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  created_at: string;
};

export type NoteTag = {
  note_id: string;
  tag_id: string;
};

export type Comment = {
  id: string;
  note_id: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
  content: string;
  created_at: string;
};

export type NoteWithTags = Note & {
  tags: Tag[];
};

export type NoteWithDisplayTitle = NoteWithTags & {
  displayTitle: string;
};

export type NoteWithTagsAndComments = NoteWithTags & {
  comments: Comment[];
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, "created_at" | "updated_at">;
        Update: Partial<Omit<Note, "id" | "created_at">>;
      };
      tags: {
        Row: Tag;
        Insert: Pick<Tag, "name">;
        Update: Pick<Tag, "name">;
      };
      note_tags: {
        Row: NoteTag;
        Insert: NoteTag;
        Update: never;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, "id" | "created_at">;
        Update: never;
      };
    };
  };
};
