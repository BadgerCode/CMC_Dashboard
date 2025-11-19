export interface Painting {
  id: string;
  size: string;
  title: string;
  authorName: string;
  createdAt: string;
  collectionId: string | null;
  collectionPosition: string | null;
}
