

// import {
//   Query as ReactCMSWebRtcQuery,
//   Mutation as ReactCMSWebRtcMutation,
// } from 'react-cms-webrtc/server/src/schema';

import ChatRoomModule from "./chatRoom";
import ChatMessageModule from "./chatMessage";
import ChatMessageReadedModule from "./chatMessageReaded";

import resolvers from "./Query";

const {
  resolvers: {
    Query: ModuleQuery,
    ...otherQuery
  },
} = resolvers;

import {
  Mutation as ModuleMutation,
} from './Mutation'

import ModuleSubscription from './subscription';


// import fs from "fs";

// import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";


import MergeSchema from 'merge-graphql-schemas';
import path from 'path';

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);
const { fileLoader, mergeTypes } = MergeSchema;



class Module extends PrismaModule {

  constructor(options = {}) {

    super(options);

    this.mergeModules([
      ChatRoomModule,
      ChatMessageModule,
      ChatMessageReadedModule,
    ]);

  }



  // getSchema(types = []) {


  //   let schema = fileLoader(__dirname + '/schema/database/', {
  //     recursive: true,
  //   });


  //   console.log(chalk.green("schema"), schema);


  //   if (schema) {
  //     types = types.concat(schema);
  //   }


  //   let typesArray = super.getSchema(types);

  //   return typesArray;

  // }




  // getApiSchema(types = [], excludeTypes = []) {


  //   let baseSchema = fs.readFileSync("src/schema/generated/prisma.graphql", "utf-8");

  //   let apiSchema = super.getApiSchema(types.concat([baseSchema]), excludeTypes.concat([
  //   ]));

  //   let schema = fileLoader(__dirname + '/schema/api/', {
  //     recursive: true,
  //   });

  //   if (schema) {
  //     apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });
  //   }

  //   return apiSchema;

  // }



  getResolvers() {

    const {
      Query,
      Mutation,
      Subscription,
      ...other
    } = super.getResolvers();

    return {
      Query: {
        ...ModuleQuery,
        ...Query,
      },
      Mutation: {
        ...ModuleMutation,
        ...Mutation,
      },
      Subscription: {
        ...ModuleSubscription,
        ...Subscription,
      },
      ...otherQuery,
      ...other,
    }
  }

}


export default Module;