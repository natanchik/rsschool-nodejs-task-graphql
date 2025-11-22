import DataLoader from 'dataloader';
import {
  PrismaClient,
  User,
  SubscribersOnAuthors,
  Post,
  Profile,
  MemberType,
} from '@prisma/client';

export interface DataLoaders {
  userSubscribedToLoader: DataLoader<string, User[]>;
  subscribedToUserLoader: DataLoader<string, User[]>;
  postsLoader: DataLoader<string, Post[]>;
  memberTypeLoader: DataLoader<string, MemberType | null>;
  profileLoader: DataLoader<string, Profile | null>;
}

export function createDataLoaders(prisma: PrismaClient): DataLoaders {
  const postsLoader = new DataLoader<string, Post[]>(
    async (userIds: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: {
          authorId: { in: userIds as string[] },
        },
      });

      const postMap = new Map<string, Post[]>();
      userIds.forEach((userId) => {
        postMap.set(userId, []);
      });

      posts.forEach((post) => {
        const existing = postMap.get(post.authorId) || [];
        existing.push(post);
        postMap.set(post.authorId, existing);
      });

      return userIds.map((userId) => postMap.get(userId) || []);
    },
    { cache: true },
  );

  const memberTypeLoader = new DataLoader<string, MemberType | null>(
    async (memberTypeIds: readonly string[]) => {
      const memberTypes = await prisma.memberType.findMany({
        where: {
          id: { in: memberTypeIds as string[] },
        },
      });

      const memberTypeMap = new Map<string, MemberType>();
      memberTypes.forEach((mt) => {
        memberTypeMap.set(mt.id, mt);
      });

      return memberTypeIds.map((id) => memberTypeMap.get(id) || null);
    },
    { cache: true },
  );

  const profileLoader = new DataLoader<string, Profile | null>(
    async (userIds: readonly string[]) => {
      const profiles = await prisma.profile.findMany({
        where: {
          userId: { in: userIds as string[] },
        },
      });

      const profileMap = new Map<string, Profile>();
      profiles.forEach((profile) => {
        profileMap.set(profile.userId, profile);
      });

      return userIds.map((userId) => profileMap.get(userId) || null);
    },
    { cache: true },
  );

  const userSubscribedToLoader = new DataLoader<string, User[]>(
    async (userIds: readonly string[]) => {
      // Get all subscriptions where these users are subscribers
      // This gives us the users that these subscribers are subscribed to
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: {
          subscriberId: { in: userIds as string[] },
        },
      });

      // Get all author IDs
      const authorIds = subscriptions.map((sub) => sub.authorId);
      // Fetch all author users
      const users = await prisma.user.findMany({
        where: {
          id: { in: authorIds },
        },
      });

      const userMap = new Map<string, User>();
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      const resultMap = new Map<string, User[]>();
      userIds.forEach((userId) => {
        resultMap.set(userId, []);
      });

      subscriptions.forEach((sub: SubscribersOnAuthors) => {
        const user = userMap.get(sub.authorId);
        if (user) {
          const existing = resultMap.get(sub.subscriberId) || [];
          existing.push(user);
          resultMap.set(sub.subscriberId, existing);
        }
      });

      return userIds.map((userId) => resultMap.get(userId) || []);
    },
    { cache: true },
  );

  const subscribedToUserLoader = new DataLoader<string, User[]>(
    async (userIds: readonly string[]) => {
      // Get all subscriptions where these users are authors
      // This gives us the users that are subscribed to these authors
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: {
          authorId: { in: userIds as string[] },
        },
      });

      // Get all subscriber IDs
      const subscriberIds = subscriptions.map((sub) => sub.subscriberId);
      // Fetch all subscriber users
      const users = await prisma.user.findMany({
        where: {
          id: { in: subscriberIds },
        },
      });

      const userMap = new Map<string, User>();
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      const resultMap = new Map<string, User[]>();
      userIds.forEach((userId) => {
        resultMap.set(userId, []);
      });

      subscriptions.forEach((sub: SubscribersOnAuthors) => {
        const user = userMap.get(sub.subscriberId);
        if (user) {
          const existing = resultMap.get(sub.authorId) || [];
          existing.push(user);
          resultMap.set(sub.authorId, existing);
        }
      });

      return userIds.map((userId) => resultMap.get(userId) || []);
    },
    { cache: true },
  );

  return {
    userSubscribedToLoader,
    subscribedToUserLoader,
    postsLoader,
    memberTypeLoader,
    profileLoader,
  };
}
