export interface Painting {
  id: string;
  /// Small, Large, Tall, Wide, MultiCanvas
  size: string;
  title: string;
  authorName: string;
  firstSeenAt: string;
  createdAt: string;
  isMultiCanvas: boolean;
}
