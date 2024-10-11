import { TwitUser } from 'user';

export type FollowResponse = {
  username: string;
  followedUsername: string;
  createdAt: string;
};

export type FollowReturn = {
  createdAt: string;
};

export type FollowersResponse = {
  follower: Omit<TwitUser, 'id'>;
  createdAt: string;
};

export type FollowersReturn = {
  id: number;
  username: string;
  name: string;
  createdAt: string;
};
