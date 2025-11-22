import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLScalarType,
  ValueNode,
  Kind,
} from 'graphql';
import { PrismaClient } from '@prisma/client';
import { DataLoaders } from './dataloaders.js';

type ResolverContext = {
  prisma: PrismaClient;
  dataloaders: DataLoaders;
  [key: string]: any;
};
type ResolverParent = any;

export const UUIDType = new GraphQLScalarType({
  name: 'UUID',
  description: 'UUID scalar type',
  serialize: (value: unknown) => {
    if (typeof value === 'string') {
      return value;
    }
    const stringValue = String(value);
    throw new TypeError(`UUID cannot represent non-string value: ${stringValue}`);
  },
  parseValue: (value: unknown) => {
    if (typeof value === 'string') {
      return value;
    }
    const stringValue = String(value);
    throw new TypeError(`UUID cannot represent non-string value: ${stringValue}`);
  },
  parseLiteral: (valueNode: ValueNode) => {
    if (valueNode.kind === Kind.STRING) {
      return valueNode.value;
    }
    return null;
  },
});

export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberTypeType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      discount: { type: new GraphQLNonNull(GraphQLFloat) },
      postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    }),
  });

export const PostType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
    }),
  });

export const ProfileType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      memberType: {
        type: new GraphQLNonNull(MemberTypeType),
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          return dataloaders.memberTypeLoader.load(parent.memberTypeId);
        },
      },
    }),
  });

export const UserType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      profile: {
        type: ProfileType,
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          return dataloaders.profileLoader.load(parent.id);
        },
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          return dataloaders.postsLoader.load(parent.id);
        },
      },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          if (parent._userSubscribedTo) {
            return parent._userSubscribedTo;
          }
          return dataloaders.userSubscribedToLoader.load(parent.id);
        },
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          if (parent._subscribedToUser) {
            return parent._subscribedToUser;
          }
          return dataloaders.subscribedToUserLoader.load(parent.id);
        },
      },
    }),
  });

export const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
  }),
});

export const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdEnum },
  }),
});

export const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  }),
});

export const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});
