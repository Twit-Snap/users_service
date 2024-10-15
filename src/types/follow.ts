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
