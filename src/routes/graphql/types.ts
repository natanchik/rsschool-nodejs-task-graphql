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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolverContext = {
  prisma: PrismaClient;
  dataloaders: DataLoaders;
  [key: string]: any;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolverParent = any;

// Custom UUID Scalar Type
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

// Member Type Enum
export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

// MemberType Output Type
export const MemberTypeType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      discount: { type: new GraphQLNonNull(GraphQLFloat) },
      postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    }),
  });

// Post Output Type
export const PostType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
    }),
  });

// Profile Output Type
export const ProfileType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      memberType: {
        type: new GraphQLNonNull(MemberTypeType),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return dataloaders.memberTypeLoader.load(parent.memberTypeId);
        },
      },
    }),
  });

// User Output Type
export const UserType: GraphQLObjectType<ResolverParent, ResolverContext> =
  new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      profile: {
        type: ProfileType,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return dataloaders.profileLoader.load(parent.id);
        },
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return dataloaders.postsLoader.load(parent.id);
        },
      },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          // If data is already pre-fetched and cached, return it
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (parent._userSubscribedTo) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return parent._userSubscribedTo;
          }
          // Otherwise use dataloader
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return dataloaders.userSubscribedToLoader.load(parent.id);
        },
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        resolve: (parent: ResolverParent, _, { dataloaders }: ResolverContext) => {
          // If data is already pre-fetched and cached, return it
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (parent._subscribedToUser) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return parent._subscribedToUser;
          }
          // Otherwise use dataloader
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return dataloaders.subscribedToUserLoader.load(parent.id);
        },
      },
    }),
  });

// Input Types
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
