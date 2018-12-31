import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";



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
        noticesConnection: this.noticesConnection,
        notices: this.notices,
        notice: this.notice,
      },
      // Mutation: {
      //   createNoticeProcessor: this.createNoticeProcessor.bind(this),
      //   updateNoticeProcessor: this.updateNoticeProcessor.bind(this),

      // },
      Subscription: {
        notice: {
          subscribe: async (parent, args, ctx, info) => {
            return ctx.db.subscription.notice(args, info)
          },
        },
      },
      // NoticeResponse: this.NoticeResponse(),
    }

  }


  notices(source, args, ctx, info) {
    return ctx.db.query.notices({}, info);
  }

  notice(source, args, ctx, info) {
    return ctx.db.query.notice({}, info);
  }

  noticesConnection(source, args, ctx, info) {
    return ctx.db.query.noticesConnection({}, info);
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