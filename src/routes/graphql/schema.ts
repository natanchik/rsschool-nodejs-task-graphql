import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import { PrismaClient } from '@prisma/client';
import {
  UserType,
  PostType,
  ProfileType,
  MemberTypeType,
  MemberTypeIdEnum,
  UUIDType,
  CreateUserInputType,
  ChangeUserInputType,
  CreateProfileInputType,
  ChangeProfileInputType,
  CreatePostInputType,
  ChangePostInputType,
} from './types.js';

const QueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberTypeType))),
      resolve: (_, __, { prisma }: { prisma: PrismaClient }) =>
        prisma.memberType.findMany(),
    },
    memberType: {
      type: MemberTypeType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: (_, args: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        prisma.memberType.findUnique({ where: { id: args.id } }),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: (_, __, { prisma }: { prisma: PrismaClient }) => prisma.user.findMany(),
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        prisma.user.findUnique({ where: { id: args.id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: (_, __, { prisma }: { prisma: PrismaClient }) => prisma.post.findMany(),
    },
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        prisma.post.findUnique({ where: { id: args.id } }),
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve: (_, __, { prisma }: { prisma: PrismaClient }) => prisma.profile.findMany(),
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        prisma.profile.findUnique({ where: { id: args.id } }),
    },
  }),
});

const MutationType = new GraphQLObjectType({
  name: 'Mutations',
  fields: () => ({
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInputType) },
      },
      resolve: (
        _,
        args: { dto: { name: string; balance: number } },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.user.create({
          data: args.dto,
        }),
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInputType) },
      },
      resolve: (
        _,
        args: {
          dto: {
            isMale: boolean;
            yearOfBirth: number;
            userId: string;
            memberTypeId: string;
          };
        },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.profile.create({
          data: args.dto,
        }),
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInputType) },
      },
      resolve: (
        _,
        args: {
          dto: {
            title: string;
            content: string;
            authorId: string;
          };
        },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.post.create({
          data: args.dto,
        }),
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInputType) },
      },
      resolve: (
        _,
        args: {
          id: string;
          dto: {
            title?: string;
            content?: string;
          };
        },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        }),
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
      },
      resolve: (
        _,
        args: {
          id: string;
          dto: {
            isMale?: boolean;
            yearOfBirth?: number;
            memberTypeId?: string;
          };
        },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        }),
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInputType) },
      },
      resolve: (
        _,
        args: {
          id: string;
          dto: {
            name?: string;
            balance?: number;
          };
        },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        }),
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        prisma.user.delete({ where: { id: args.id } }).then(() => 'deleted'),
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        prisma.post.delete({ where: { id: args.id } }).then(() => 'deleted'),
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        prisma.profile.delete({ where: { id: args.id } }).then(() => 'deleted'),
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (
        _,
        args: { userId: string; authorId: string },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.subscribersOnAuthors
          .create({
            data: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          })
          .then(() => 'subscribed'),
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (
        _,
        args: { userId: string; authorId: string },
        { prisma }: { prisma: PrismaClient },
      ) =>
        prisma.subscribersOnAuthors
          .delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          })
          .then(() => 'unsubscribed'),
    },
  }),
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
