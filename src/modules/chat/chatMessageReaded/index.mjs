import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";



class ChatMessageReadedProcessor extends Processor {



  constructor(props) {

    super(props);

    this.objectType = "ChatMessageReaded";

  }


  async create(objectType, args, info) {


    let {
      data
    } = args;


    const {
      id: currentUserId,
    } = await this.getUser(true);

    Object.assign(data, {
      User: {
        connect: {
          id: currentUserId,
        },
      },
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
        chatMessageReadedsConnection: this.chatMessageReadedsConnection,
        chatMessageReaded: this.chatMessageReaded,
      },
      Mutation: {
        createChatMessageReadedProcessor: this.createChatMessageReadedProcessor.bind(this),
        // updateChatMessageReadedProcessor,

      },
      Subscription: {
        chatMessageReaded: {
          subscribe: async (parent, args, ctx, info) => {

            // console.log(chalk.green("chatRoom subs args"), args);

            // // return "Sdfdsf";

            // const {
            //   where: {
            //     token,
            //   },
            // } = args;

            // const userId = await getUserId(ctx, token);

            // if (!userId) {
            //   throw (new Error("Please, log in"));
            // }

            // // const userId = "cjcwr8ev954yz0116e6fxnx57";


            // // Очищаем все аргументы
            // info.fieldNodes.map(n => {
            //   n.arguments = []
            // });

            // return ctx.db.subscription.chatRoom({
            //   where: {
            //     node: {
            //       Members_some: {
            //         id: userId,
            //       }
            //     }
            //   }
            // }, info)
            return ctx.db.subscription.chatMessageReaded(args, info)
          },
        },
      },
      ChatMessageReadedResponse: this.ChatMessageReadedResponse(),
      // ChatMessageReaded: {
      //   CreatedBy: ChatMessageReadedCreatedBy,
      // },
      // ChatMessageReadedProcessor: {
      //   data: ChatMessageReadedProcessorData,
      // },
    }

  }


  chatMessageReadeds(source, args, ctx, info) {
    return ctx.db.query.chatMessageReadeds({}, info);
  }

  chatMessageReaded(source, args, ctx, info) {
    return ctx.db.query.chatMessageReaded({}, info);
  }

  chatMessageReadedsConnection(source, args, ctx, info) {
    return ctx.db.query.chatMessageReadedsConnection({}, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return ChatMessageReadedProcessor;
  }

  createChatMessageReadedProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("ChatMessageReaded", args, info);
  }

  ChatMessageReadedResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.chatMessageReaded({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default Module;