import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";


import {
  prepareAccesibleMessagesQuery,
} from "../../helpers";


export class ChatMessageReadedProcessor extends Processor {



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

export class ChatMessageReadedModule extends PrismaModule {


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

            // console.log(chalk.green("chatMessageReaded subs args"), args);


            // console.log("chatMessage subscribe");

            let {
              node,
              ...where
            } = args.where || {}


            let {
              Message,
              ...otherNode
            } = node || {}

            // Object.assign(args, {
            // });

            Message = prepareAccesibleMessagesQuery({
              where: Message,
            }, ctx);

            // console.log("chatMessageReaded subscribe where Message", JSON.stringify(Message, true, 2));

            let AND = []

            if (otherNode) {
              AND.push({
                ...otherNode,
              });
            }

            if (Message) {
              AND.push({
                Message,
              });
            }

            where = {
              ...where,
              node: {
                AND,
              }
            }

            // Object.assign(args, {
            //   where: {
            //     ...where,
            //     node,
            //   },
            // });

            Object.assign(args, {
              where,
            });

            // console.log("chatMessageReaded subscribe where args.where", JSON.stringify(where, true, 2));


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
    return ctx.db.query.chatMessageReadeds(args, info);
  }

  chatMessageReaded(source, args, ctx, info) {
    return ctx.db.query.chatMessageReaded(args, info);
  }

  chatMessageReadedsConnection(source, args, ctx, info) {
    return ctx.db.query.chatMessageReadedsConnection(args, info);
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


export default ChatMessageReadedModule;