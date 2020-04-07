
import startServer from "@prisma-cms/server";

import PrismaCmsUserModule from "@prisma-cms/user-module";

import Module, {
  Modules,
} from "../";


const module = new Module({
  modules: Modules.concat([
    PrismaCmsUserModule,
  ]),
});

const resolvers = module.getResolvers();


startServer({
  typeDefs: 'src/schema/generated/api.graphql',
  resolvers,
  contextOptions: {
    // debug: true,
  },
});
