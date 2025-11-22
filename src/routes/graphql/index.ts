import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate } from 'graphql';
import { schema } from './schema.js';
import depthLimit from 'graphql-depth-limit';
import { parse } from 'graphql';
import { createDataLoaders } from './dataloaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const validationRules = [depthLimit(5)];

      let result;
      try {
        const document = parse(query);
        const errors = validate(schema, document, validationRules);

        if (errors.length > 0) {
          result = { errors };
        } else {
          const dataloaders = createDataLoaders(prisma);

          result = await graphql({
            schema,
            source: query,
            variableValues: variables,
            contextValue: { prisma, dataloaders },
          });
        }
      } catch (error) {
        result = { errors: [{ message: String(error) }] };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    },
  });
};

export default plugin;
