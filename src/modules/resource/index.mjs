
import fs from "fs";

import chalk from "chalk";

import PrismaCmsResourceModule from "@prisma-cms/resource-module";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema



class ResourceModule extends PrismaCmsResourceModule {


  // constructor(props = {}) {

  //   super(props);

  //   Object.assign(this, {
  //   });

  // }


  // getSchema(types = []) {


  //   let schema = fileLoader(__dirname + '/schema/database/', {
  //     recursive: true,
  //   });


  //   if (schema) {
  //     types = types.concat(schema);
  //   }


  //   let typesArray = super.getSchema(types);

  //   return typesArray;

  // }


  // getApiSchema(types = []) {


  //   let baseSchema = [];

  //   let schemaFile = "src/schema/generated/prisma.graphql";

  //   if (fs.existsSync(schemaFile)) {
  //     baseSchema = fs.readFileSync(schemaFile, "utf-8");
  //   }

  //   let apiSchema = super.getApiSchema(types.concat(baseSchema), []);

  //   let schema = fileLoader(__dirname + '/schema/api/', {
  //     recursive: true,
  //   });

  //   apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


  //   return apiSchema;

  // }


  // getResolvers() {

  //   const resolvers = super.getResolvers();


  //   Object.assign(resolvers.Query, this.Query);

  //   Object.assign(resolvers.Mutation, this.Mutation);

  //   Object.assign(resolvers.Subscription, this.Subscription);


  //   Object.assign(resolvers, {
  //   });

  //   return resolvers;
  // }


}


export default ResourceModule;