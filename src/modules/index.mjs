
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema


import UserModule from "./user";
import ResourceModule from "./resource";
import NoticeModule from "./notice";
import ChatModule from "./chat";


class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);
    
    this.mergeModules([
      UserModule,
      ResourceModule,
      NoticeModule,
      ChatModule,
    ]);

  }


  getSchema(types = []) {


    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  getApiSchema(types = []) {


    let baseSchema = [];

    let schemaFile = __dirname + "/../schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), [
      "ChatRoomCreateInput",
      "ChatRoomUpdateInput",
      "UserCreateManyWithoutRoomsInput",

      "ChatMessageCreateInput",
      "ChatRoomCreateOneWithoutMessagesInput",

      "ChatMessageReadedCreateInput",
      "ChatMessageCreateOneWithoutReadedByInput",
    ]);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      tag: (source, args, ctx, info) => ctx.db.query.tag({}, info),
      tags: (source, args, ctx, info) => ctx.db.query.tags({}, info),
      tagsConnection: (source, args, ctx, info) => ctx.db.query.tagsConnection({}, info),

      resourceTag: (source, args, ctx, info) => ctx.db.query.resourceTag({}, info),
      resourceTags: (source, args, ctx, info) => ctx.db.query.resourceTags({}, info),
      resourceTagsConnection: (source, args, ctx, info) => ctx.db.query.resourceTagsConnection({}, info),

      notificationType: (source, args, ctx, info) => ctx.db.query.notificationType({}, info),
      notificationTypes: (source, args, ctx, info) => ctx.db.query.notificationTypes({}, info),
      notificationTypesConnection: (source, args, ctx, info) => ctx.db.query.notificationTypesConnection({}, info),

      vote: (source, args, ctx, info) => ctx.db.query.vote({}, info),
      votes: (source, args, ctx, info) => ctx.db.query.votes({}, info),
      votesConnection: (source, args, ctx, info) => ctx.db.query.votesConnection({}, info),
      
      resource: (source, args, ctx, info) => ctx.db.query.resource({}, info),
      resources: (source, args, ctx, info) => ctx.db.query.resources({}, info),
      resourcesConnection: (source, args, ctx, info) => ctx.db.query.resourcesConnection({}, info),
    });
    

    Object.assign(resolvers.Mutation, this.Mutation);

    Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
    });

    return resolvers;
  }


}


export default Module;