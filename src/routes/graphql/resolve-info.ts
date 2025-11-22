import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

export interface RequestedRelations {
  posts?: boolean;
  profile?: boolean;
  userSubscribedTo?: boolean;
  subscribedToUser?: boolean;
}

export function getRequestedRelations(info: GraphQLResolveInfo): RequestedRelations {
  try {
    const parsed = parseResolveInfo(info);
    if (!parsed) return {};

    // The parsed result has fieldsByTypeName structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed_any = parsed as any;
    // Get the User type fields
    const userFields = parsed_any.fieldsByTypeName?.User || {};

    return {
      posts: 'posts' in userFields,
      profile: 'profile' in userFields,
      userSubscribedTo: 'userSubscribedTo' in userFields,
      subscribedToUser: 'subscribedToUser' in userFields,
    };
  } catch {
    return {};
  }
}
