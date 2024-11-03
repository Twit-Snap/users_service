export type FollowReturn = {
  userId: number;
  followedId: number;
  createdAt: string;
};

export type FollowersResponse = {
  id: number;
  name: string;
  username: string;
  followCreatedAt: string;
};

export type GetAllFollowsParams = {
  byFollowers: boolean;
  has: string;
  createdAt?: string;
  limit?: number;
};
