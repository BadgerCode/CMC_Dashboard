export interface Painting {
  id: string;
  size: string;
  title: string;
  authorName: string;
  firstSeenAt: string;
  collectionId: string | null;
  collectionPosition: string | null;
}
