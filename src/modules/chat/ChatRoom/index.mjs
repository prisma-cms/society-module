import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import {
  prepareAccesibleRoomsQuery,
} from "../../helpers";

export class ChatRoomProcessor extends Processor {



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

    /**
     * ToDo: Надо фильтровать подключаемых пользователей
     * по признаку acceptNewChatRoom, то есть разрешает
     * ли пользователь новые диалоги с ним.
     */

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


  async join(args, info) {

    const {
      db,
      currentUser,
    } = this.ctx;

    let {
      where,
    } = args;

    if (!currentUser) {
      throw new Error("Пожалуйста, авторизуйтесь");
    }

    const {
      id: currentUserId,
    } = currentUser;

    const chatRoom = await db.query.chatRoom({
      where,
    }, `
      {
        id,
        Members(
          where: {
            id: "${currentUserId}"
          },
        ){
          id
        }
        Invitations(
          where: {
            User: {
              id: "${currentUserId}"
            },
          }
        ){
          id
        }
        isPublic
      }
    `);


    if (!chatRoom) {
      throw new Error("Не была получена комната");
    }

    const {
      Members,
      isPublic,
      Invitations,
    } = chatRoom;

    if (Members.length) {
      throw new Error("Вы уже состоите в этой комнате");
    }

    if (!isPublic && !Invitations.length) {
      throw new Error("Нельзя вступить в приватную комнату без приглашения");
    }

    return db.mutation.updateChatRoom({
      ...args,
      data: {
        Members: {
          connect: {
            id: currentUserId,
          },
        },
      },
    }, info)
      .then(async r => {

        const {
          id: roomId,
        } = r || {}

        if (Invitations.length) {

          Invitations.map(n => {

            db.mutation.deleteChatRoomInvitation({
              where: {
                id: n.id,
              },
            })
              .catch(console.error);

          })


        }

        return r;
      });

    // return super.update("ChatRoom", {
    //   ...args,
    //   data: {},
    // }, info);
  }

  async leave(args, info) {


    // this.addError("wefwef");

    // return {}


    const {
      db,
      currentUser,
    } = this.ctx;

    let {
      where,
    } = args;

    if (!currentUser) {
      throw new Error("Пожалуйста, авторизуйтесь");
    }

    const {
      id: currentUserId,
    } = currentUser;

    const chatRoom = await db.query.chatRoom({
      where,
    }, `
      {
        id,
        Members(
          where: {
            id: "${currentUserId}"
          },
        ){
          id
        }
        CreatedBy{
          id
        }
      }
    `);


    if (!chatRoom) {
      throw new Error("Не была получена комната");
    }

    const {
      Members,
      CreatedBy,
    } = chatRoom;

    if (CreatedBy.id === currentUserId) {
      throw new Error("Нельзя покинуть свою комнату");
    }

    if (!Members.length) {
      throw new Error("Вы не состоите в этой комнате");
    }

    return db.mutation.updateChatRoom({
      ...args,
      data: {
        Members: {
          disconnect: {
            id: currentUserId,
          },
        },
      },
    }, info);

    // return super.update("ChatRoom", {
    //   ...args,
    //   data: {},
    // }, info);
  }


  async invite(args, info) {

    let result = false;

    let {
      data: {
        User,
        ...data
      },
      where,
    } = args;


    const {
      db,
      currentUser,
    } = this.ctx;


    const {
      id: currentUserId,
    } = currentUser || {}


    const InvitedUser = await db.query.user({
      where: User,
    });

    if (!InvitedUser) {
      throw new Error("Не был получен пользователь");
    }

    const {
      id: invitedUserId,
    } = InvitedUser;


    const chatRoom = await db.query.chatRoom({
      where,
    }, `
      {
        id,
        Invited: Members(
          where: {
            id: "${invitedUserId}"
          },
        ){
          id
        }
        Current: Members(
          where: {
            id: "${currentUserId}"
          },
        ){
          id
        }
        CreatedBy{
          id
        }
        Invitations(
          where: {
            User: {
              id: "${invitedUserId}"
            },
          }
        ){
          id
        }
      }
    `);

    // console.log("chatRoom", chatRoom);

    if (!chatRoom) {
      throw new Error("Не была получена комната");
    }

    const {
      Invited,
      Current,
      CreatedBy,
      Invitations,
    } = chatRoom;

    if (currentUserId === invitedUserId) {
      throw new Error("Нельзя приглашать самого себя");
    }

    if (Invitations.length) {
      throw new Error("Пользователь уже приглашен в эту комнату");
    }

    if (Invited.length) {
      throw new Error("Пользователь уже в этой комнате");
    }

    if (!Current.length) {
      throw new Error("Вы не состоите в этой комнате и не можете никого приглашасить");
    }



    Object.assign(data, {
      Invitations: {
        create: {
          User: {
            connect: User,
          },
          CreatedBy: {
            connect: {
              id: currentUserId,
            },
          },
        },
      },
    });

    Object.assign(args, {
      data,
    });


    await db.mutation.updateChatRoom(args)
      .then(async room => {

        // console.log("updateChatRoom", room);

        if (room) {

          result = true;

          const {
            id: roomId,
          } = room;

          /**
           * Создаем уведомление для приглашенного
           */

          const ChatRoomInvitations = await db.query.chatRoomInvitations({
            where: {
              ChatRoom: {
                id: roomId,
              },
              User,
            },
            last: 1,
          })
            .catch(console.error);

          const ChatRoomInvitation = ChatRoomInvitations && ChatRoomInvitations[0] || null;

          // console.log("ChatRoomInvitations", ChatRoomInvitations);

          if (!ChatRoomInvitation) {
            console.error(chalk.red("ChatRoomInvitation is empty"), roomId);
          }
          else {

            const {
              id: invitationId,
            } = ChatRoomInvitation;

            await db.mutation.createNotice({
              data: {
                type: "ChatRoomInvitation",
                CreatedBy: {
                  connect: {
                    id: currentUserId,
                  }
                },
                User: {
                  connect: User,
                },
                ChatRoomInvitation: {
                  connect: {
                    id: invitationId,
                  }
                },
              }
            })
              .catch(console.error);

          }

        }

        return room;
      })
    // .catch(console.error);


    return result;
  }

}

export class ChatRoomModule extends PrismaModule {


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
        joinChatRoom: this.joinChatRoom.bind(this),
        leaveChatRoom: this.leaveChatRoom.bind(this),
        inviteChatRoomProcessor: this.inviteChatRoomProcessor.bind(this),
      },
      Subscription: {
        chatRoom: {
          subscribe: async (parent, args, ctx, info) => {

            // console.log("Subscription chatRoom args", args);

            // return ctx.db.subscription.chatRoom(args, info)

            // console.log(chalk.green("chatRoom subs args"), args);

            // console.log(chalk.green("ctx.currentUser"), ctx.currentUser);

            // return "Sdfdsf";

            const {
              currentUser,
            } = ctx;

            const {
              id: userId,
            } = currentUser || {};

            let where;

            if (!userId) {
              // throw (new Error("Please, log in"));
              where = {
                node: {
                  id: null,
                }
              }
            }
            else {
              where = {
                node: {
                  Members_some: {
                    id: userId,
                  }
                }
              }
            }

            // const userId = "cjcwr8ev954yz0116e6fxnx57";


            // Очищаем все аргументы
            info.fieldNodes.map(n => {
              n.arguments = []
            });

            return ctx.db.subscription.chatRoom({
              where,
            }, info)

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

    // console.log('chatRoomsConnection args', JSON.stringify(args, true, 2));

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

  joinChatRoom(source, args, ctx, info) {

    return this.getProcessor(ctx).join(args, info);
  }

  leaveChatRoom(source, args, ctx, info) {

    return this.getProcessor(ctx).leave(args, info);
  }

  inviteChatRoomProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).invite(args, info);
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


export default ChatRoomModule;