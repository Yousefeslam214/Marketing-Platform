export type AdData = {
  id: string;
  userId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  websiteUrl: string;
  imageUrl: string | string[] | null;
  youtubeVideo?: string | null;
  status: string;
  targetAudience: string;
  budgetType: string;
  publishToken: string | null;
  approvedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};
