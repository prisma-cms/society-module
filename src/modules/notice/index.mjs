import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import {
  prepareAccesibleNoticesQuery,
} from "../helpers";


class NoticeProcessor extends Processor {



  constructor(props) {

    super(props);

    this.objectType = "Notice";

    this.private = false;

  }


  async create(objectType, args, info) {

    let {
      data: {
        Members,
        ...data
      },
    } = args;

    const {
      id: currentUserId,
    } = await this.getUser(true);


    Members = Members || {};


    let {
      connect,
    } = Members;

    connect = connect || [];

    connect.push({
      id: currentUserId,
    });


    Object.assign(Members, {
      connect,
    });

    Object.assign(data, {
      CreatedBy: {
        connect: {
          id: currentUserId,
        },
      },
      Members,
    });


    Object.assign(args, {
      data,
    });

    return super.create(objectType, args, info);

  }

  async mutate(method, args, info) {


    return super.mutate(method, args);
  }

}

class Module extends PrismaModule {


  getResolvers() {


    return {
      Query: {
        noticesConnection: this.noticesConnection.bind(this),
        notices: this.notices.bind(this),
        notice: this.notice.bind(this),
      },
      Mutation: {
        // createNoticeProcessor: this.createNoticeProcessor.bind(this),
        // updateNoticeProcessor: this.updateNoticeProcessor.bind(this),
        deleteNotice: this.deleteNotice.bind(this),
        deleteManyNotices: this.deleteManyNotices.bind(this),

      },
      Subscription: {
        notice: {
          subscribe: async (parent, args, ctx, info) => {

            const {
              currentUser,
            } = ctx;

            const {
              id: currentUserId,
            } = currentUser || {};

            if (!currentUserId) {
              throw new Error("Необходимо авторизоваться");
              // return "Необходимо авторизоваться";
            }

            let {
              where,
            } = args;


            const {
              node,
              ...other
            } = where || {};

            const OR = [
              {
                User: {
                  id: currentUserId,
                },
              },
              {
                CreatedBy: {
                  id: currentUserId,
                },
              },
            ];

            where = {
              AND: [
                {
                  ...node,
                },
                {
                  ...other,
                },
                {
                  node: {
                    OR,
                  },
                },
              ],

            };

            // console.log(chalk.green("notice where"), where);
            // console.log(chalk.green("notice OR"), OR);
            // console.log(chalk.green("notice where currentUserId"), currentUserId);

            Object.assign(args, {
              where,
            });

            return ctx.db.subscription.notice(args, info)
          },
        },
      },
      // NoticeResponse: this.NoticeResponse(),
    }

  }


  async notice(source, args, ctx, info) {
    // return ctx.db.query.notice({}, info);
    let objects = await this.notices(source, args, ctx, info);

    return objects && objects[0] || null;
  }

  notices(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareNoticesQueryArgs(args, ctx),
    });

    return ctx.db.query.notices(args, info);
  }

  noticesConnection(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareNoticesQueryArgs(args, ctx),
    });

    return ctx.db.query.noticesConnection(args, info);
  }


  prepareNoticesQueryArgs(args, ctx) {

    return prepareAccesibleNoticesQuery(args, ctx);
  }

  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return NoticeProcessor;
  }

  createNoticeProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Notice", args, info);
  }

  updateNoticeProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("Notice", args, info);
  }

  deleteNotice(source, args, ctx, info) {

    return ctx.db.mutation.deleteNotice(args, info);
  }


  /**
   * For current user only
   */
  deleteManyNotices(source, args, ctx, info) {

    const {
      currentUser,
    } = ctx;

    const {
      id: currentUserId,
    } = currentUser || {};

    if (!currentUserId) {
      return 0;
    }

    let {
      where,
    } = args;

    where = {
      AND: [
        {
          ...where,
        },
        {
          User: {
            id: currentUserId,
          },
        },
      ],
    }

    Object.assign(args, {
      where,
    });

    return ctx.db.mutation.deleteManyNotices(args, info);
  }

  NoticeResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source && source.data || {};

        return id ? ctx.db.query.notice({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default Module;