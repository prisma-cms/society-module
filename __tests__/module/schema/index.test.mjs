
import expect from 'expect'

import chalk from "chalk";

import {
  verifySchema,
} from "../../default/schema.test.mjs";

import TestModule from "../../../";


import mocha from 'mocha'
const { describe, it } = mocha

const module = new TestModule();


/**
 */

const requiredTypes = [
  {
    name: "Query",
    fields: {
      both: [
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "User",
    fields: {
      both: [
        "id",
        "Votes",
        "NotificationTypes",
        "Tags",
        "ResourceTags",
      ],
      prisma: [
      ],
      api: [
        "Notifications",
      ],
    },
  },
  {
    name: "Resource",
    fields: {
      both: [
        "id",
        "Tags",
        // "commentsCount",
        "rating",
        "positiveVotesCount",
        "negativeVotesCount",
        "neutralVotesCount",
        "Votes",
        "CommentTarget",
        "Comments",
        "CreatedBy",
      ],
      prisma: [
      ],
      api: [
        "Thread",
      ],
    },
  },
  {
    name: "Tag",
    fields: {
      both: [
        "id",
        "createdAt",
        "updatedAt",
        "name",
        // "count",
        "status",
        "Resources",
        "CreatedBy",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "ResourceTag",
    fields: {
      both: [
        "id",
        "createdAt",
        "updatedAt",
        "status",
        "CreatedBy",
        "Resource",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  // {
  //   name: "Thread",
  //   fields: {
  //     both: [
  //     ],
  //     prisma: [
  //     ],
  //     api: [
  //       "id",
  //       "createdAt",
  //       "updatedAt",
  //       // "targetId",
  //       // "targetType",
  //       "commentsCount",
  //       "rating",
  //       "positiveVotesCount",
  //       "negativeVotesCount",
  //       "neutralVotesCount",
  //       "Votes",
  //       "Comments",
  //       "Resource",
  //     ],
  //   },
  // },
  {
    name: "Vote",
    fields: {
      both: [
        "id",
        "createdAt",
        "updatedAt",
        "value",
        "User",
        "Resource",
      ],
      prisma: [
      ],
      api: [
        "Thread",
      ],
    },
  },
  {
    name: "NotificationType",
    fields: {
      both: [
        "id",
        "name",
        "comment",
        "Users",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  // {
  //   name: "Comment",
  //   fields: {
  //     both: [
  //     ],
  //     prisma: [
  //     ],
  //     api: [
  //       "id",
  //       "createdAt",
  //       "updatedAt",
  //       "text",
  //       "createdby",
  //       "Author",
  //       "parent",
  //       "Parent",
  //       "deleted",
  //       "published",
  //       "comments_count",
  //       "thread_id",
  //       "Thread",
  //       "topic_id",
  //       "Topic",
  //       "Childs",
  //       "CreatedBy",
  //     ],
  //   },
  // },
]




describe('modxclub Verify prisma Schema', () => {

  verifySchema(module.getSchema(), requiredTypes);

});


describe('modxclub Verify API Schema 2', () => {

  verifySchema(module.getApiSchema(), requiredTypes);

});