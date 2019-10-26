
import prismaGenerateSchema from "@prisma-cms/prisma-schema";

import CoreModule from "../../../";


import path from 'path';
import chalk from "chalk";

import PrismaCmsUserModule from "@prisma-cms/user-module";

export const generateSchema = function (schemaType) {

  let result;

  try {

    const moduleURL = new URL(import.meta.url);
    const basedir = path.join(path.dirname(moduleURL.pathname), "/../../../", "schema/")


    result = prismaGenerateSchema(schemaType, new CoreModule({
      modules: [
        PrismaCmsUserModule,
      ],
    }), basedir);
  }
  catch (error) {

    console.error(chalk.red("generateSchema Error"), error);
  }

  return result;

}

export default generateSchema;