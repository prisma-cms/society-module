
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
        "Thread",
        "Tags",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "Thread",
    fields: {
      both: [
        "id",
        "createdAt",
        "updatedAt",
        // "targetId",
        // "targetType",
        "commentsCount",
        "rating",
        "positiveVotesCount",
        "negativeVotesCount",
        "neutralVotesCount",
        "Votes",
        "Comments",
        "Resource",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "Vote",
    fields: {
      both: [
        "id",
        "createdAt",
        "updatedAt",
        "value",
        "Thread",
        "User",
      ],
      prisma: [
      ],
      api: [
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
  {
    name: "Tag",
    fields: {
      both: [
        "name",
        "count",
        "Resources",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  // {
  //   name: "TopicTag",
  //   fields: {
  //     both: [
  //     ],
  //     prisma: [
  //     ],
  //     api: [
  //       "id",
  //       "name",
  //       "topic_id",
  //       "Topic",
  //     ],
  //   },
  // },
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