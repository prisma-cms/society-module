import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import {
  prepareAccesibleRoomsQuery,
} from "../../helpers";

class ChatRoomProcessor extends Processor {



  constructor(props) {

    super(props);

    this.objectType = "ChatRoom";

    this.private = true;

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
        chatRoomsConnection: this.chatRoomsConnection.bind(this),
        chatRooms: this.chatRooms.bind(this),
        chatRoom: this.chatRoom.bind(this),
      },
      Mutation: {
        createChatRoomProcessor: this.createChatRoomProcessor.bind(this),
        updateChatRoomProcessor: this.updateChatRoomProcessor.bind(this),

      },
      Subscription: {
        chatRoom: {
          subscribe: async (parent, args, ctx, info) => {
            return ctx.db.subscription.chatRoom(args, info)
          },
        },
      },
      ChatRoomResponse: this.ChatRoomResponse(),
      // ChatRoom: {
      //   Members: () => [],
      // },
    }

  }


  async chatRoom(source, args, ctx, info) {
    // return ctx.db.query.chatRoom(args, info);

    let objects = await this.chatRooms(source, args, ctx, info);

    return objects && objects[0] || null;
  }

  chatRooms(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareChatRoomsQueryArgs(args, ctx),
    });

    return ctx.db.query.chatRooms(args, info);
  }

  chatRoomsConnection(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareChatRoomsQueryArgs(args, ctx),
    });

    return ctx.db.query.chatRoomsConnection(args, info);
  }


  /**
   * Получить можно только публичные комнаты, 
   * или в которых пользователь состоит
   */
  prepareChatRoomsQueryArgs(args, ctx) {

    // let {
    //   where,
    // } = args;

    // const {
    //   currentUser,
    // } = ctx;

    // const {
    //   id: currentUserId,
    // } = currentUser || {};


    // let OR = [
    //   {
    //     isPublic: true,
    //   },
    // ];

    // if (currentUserId) {
    //   OR.push({
    //     Members_some: {
    //       id: currentUserId,
    //     },
    //   });
    // }


    // return {
    //   OR,
    //   AND: where ? {
    //     ...where,
    //   } : undefined,
    // };

    return prepareAccesibleRoomsQuery(args, ctx);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return ChatRoomProcessor;
  }

  createChatRoomProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("ChatRoom", args, info);
  }

  updateChatRoomProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("ChatRoom", args, info);
  }

  ChatRoomResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source && source.data || {};

        return id ? ctx.db.query.chatRoom({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default Module;