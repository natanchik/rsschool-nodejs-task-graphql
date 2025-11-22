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

    const parsed_any = parsed as any;
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
