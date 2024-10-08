import { makeExecutableSchema } from 'graphql-tools'

import { typeDefs, resolvers } from './merge'
// import { buildFederatedSchema } from '@apollo/federation';

const schema = makeExecutableSchema({ typeDefs, resolvers })
// const schema = buildFederatedSchema( { typeDefs, resolvers } );
export default schema
