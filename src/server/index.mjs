
import startServer from "@prisma-cms/server";

import Module, {
  Modules,
} from "../";


const module = new Module({
  modules: Modules,
});

const resolvers = module.getResolvers();


startServer({
  typeDefs: 'src/schema/generated/api.graphql',
  resolvers,
});
