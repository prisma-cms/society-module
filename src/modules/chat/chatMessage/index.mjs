import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import {
  prepareAccesibleMessagesQuery,
} from "../helpers";

class ChatMessageProcessor extends Processor {



  constructor(props) {

    super(props);

    this.objectType = "ChatMessage";

    this.private = true;

  }


  /**
   * Создаем чат-сообщение.
   * При этом создается или подключается чат-комната.
   */
  async create(objectType, args, info) {

    const {
      db,
    } = this.ctx;

    let {
      data: {
        Room: {
          to,
          ...Room
        },
        ...data
      },
    } = args;

    const {
      id: currentUserId,
    } = await this.getUser(true);


    const {
      content,
    } = this.prepareContent(args) || {};

    if (!content) {
      return this.addError("Сообщение не заполнено");
    }

    Room = Room || {}


    let {
      connect,
    } = Room;


    let {
      id: roomId,
    } = connect || {}

    /**
     * Если указан roomId (ID комнаты), то смотрим по ней, и чтобы отправитель был в этой комнате,
     * а кому он шлет - это уже его дело.
     * Если указан to (ID пользователя), то смотрим по нему.
     */

    // let {
    //   to,
    //   roomId,
    //   ...messageData
    // } = args;



    let chatRoom;


    if (roomId) {


      // Пытаемся получить чат-комнату
      chatRoom = await this.getRoomWithMember({
        where: {
          id: roomId,
          OR: [
            {
              isPublic: true,
            },
            {
              Members_some: {
                id: currentUserId
              },
            }
          ],
        },
      });

      if (!chatRoom) {
        return this.addError("Не была получена чат-комната");
      }

    }

    else if (to) {

      // Проверяем есть ли пользователь
      const toUser = await db.query.user({
        where: {
          id: to,
        },
      });

      // console.log(chalk.green("toUser"), toUser);



      // console.log(chalk.green("Creat room args"), args);


      if (!toUser) {
        return this.addError("Не был получен пользователь");
      }
      else {

        const {
          id: toUserId,
        } = toUser;

        // Пытаемся получить чат-комнату
        chatRoom = await this.getRoomWithMember({
          where: {
            AND: [{
              Members_some: {
                id: currentUserId
              },
            }, {
              Members_some: {
                id: toUserId,
              },
            }],
            Members_none: { id_not_in: [currentUserId, toUserId] }
          },
        });

        // console.log("chatRoom", chatRoom);

        // Если нет чат-комнаты, создаем новую
        if (!chatRoom) {

          let name = (await db.query.users({
            where: {
              id_in: [currentUserId, toUser.id],
            },
          })).map(({
            username,
            firstname,
            lastname,
            fullname,
          }) => fullname || [firstname, lastname].filter(n => n).join(" ") || username).join(", ");


          Room = {
            create: {
              name,
              Members: {
                connect: [{
                  id: currentUserId,
                }, {
                  id: toUserId,
                }],

                // connect: [{
                //   id: "cjcwr8ev954yz0116e6fxnx57",
                // },{
                //   id: "cjcww5hnt73fr0116nrl4vrj7",
                // }],
              },
              CreatedBy: {
                connect: {
                  id: currentUserId,
                },
              },
            },
          }



        }
        else {

          /**
           * Обновляем комнату, чтобы актуализировать сортировку комнат
           * Важно это сделать раньше обновления сообщения, чтобы результат попал в сообщение
           * Пока не работает
           */

          const {
            id: roomId,
          } = chatRoom;

          Room = {
            connect: {
              id: roomId,
            },
          }
        }

      }

    }

    else {

      return this.addError("Can not get roomId or recipient");
    }





    // console.log("chatRoom 2", chatRoom);

    // if (!chatRoom) {
    //   success = false;
    //   message = "Can not get chat room";
    // }
    // else {

    // const {
    //   id: chatId,
    // } = chatRoom;


    // if (!errors.length && success !== false) {



    Object.assign(data, {
      CreatedBy: {
        connect: {
          id: currentUserId,
        },
      },
      Room,
    });


    Object.assign(args, {
      data,
    });

    return await super.create(objectType, args, info)
      .then(async r => {


        const {
          id: messageId,
        } = r || {};


        if (messageId) {

          /**
           * Если пользователь не состоит в текущем чате и это публичный чат, 
           * то добавляем пользователя в него
           */

          // console.log("chatRoom", chatRoom);

          if (chatRoom) {

            const {
              id: chatRoomId,
              isPublic,
              Members,
            } = chatRoom;

            // console.log("Members", Members);

            if (isPublic && Members.findIndex(({ id }) => id === currentUserId) === -1) {

              const result = await db.mutation.updateChatRoom({
                where: {
                  id: chatRoomId,
                },
                data: {
                  Members: {
                    connect: {
                      id: currentUserId,
                    },
                  },
                },
              })
                .catch(console.error);

              // console.log("Members result", result);
            }
          }


          // Создаем уведомление, если сообщение не прочитано в течение минуты
          // и если нет уведомлений в этой ветке

          setTimeout(async () => {

            await db.query.chatMessage({
              where: {
                id: messageId,
              },
            }, `
            {
              id
              Room{
                id
                Members(
                  where:{
                    id_not: "${currentUserId}"
                  }
                ){
                  id
                }
              }
              ReadedBy{
                id
                User{
                  id
                }
              }
            } 
            `)
              .then(async message => {

                console.log(chalk.green("message"), message);

                // return;

                const {
                  Room,
                  ReadedBy,
                } = message;

                const {
                  Members = [],
                } = Room || {};

                Members
                  .filter(({ id }) => ReadedBy.findIndex(n => n.User.id === id) === -1)
                  .map(async member => {


                    const {
                      id: memberId,
                    } = member;

                    await db.mutation.createNotice({
                      data: {
                        type: "ChatMessage",
                        User: {
                          connect: {
                            id: memberId,
                          }
                        },
                        ChatMessage: {
                          connect: {
                            id: messageId,
                          }
                        },
                      }
                    })
                      .catch(console.error);

                  });

              })
              .catch(error => {
                console.error(chalk.red("Get message error"), error)
              });


          }, 1000 * 30)

        }



        return r;
      })
  }


  async mutate(method, args, info) {

    this.prepareContent(args);

    return super.mutate(method, args);
  }


  prepareContent(args) {

    let {
      data,
    } = args;

    let {
      content,
    } = data || {}

    if (content !== undefined) {

      const {
        blocks,
      } = content || {};

      if (blocks && blocks.length) {

        let textArray = blocks && blocks.map(({ text }) => text && text.trim() || "").filter(n => n) || [];

        let contentText = textArray.join("\n");

        Object.assign(data, {
          content,
          contentText,
        });

        if (contentText) {
          return {
            content,
            contentText,
          }
        }
      }
      // else {
      //   return this.addError("Сообщение не заполнено");
      // }

    }
  }


  async getRoomWithMember(args) {

    const {
      db,
    } = this.ctx;

    const {
      where,
    } = args;

    let chatRoom;

    const chatRooms = await db.request(`
    query chatRooms(
      $chatRoomsWhere:ChatRoomWhereInput
    ){
      chatRooms(
        where:$chatRoomsWhere
      ){
        id
        code
        name
        isPublic
        Members{
          id
          username
        }
      }
    }
  `, {
        chatRoomsWhere: where,
      }).then(r => r.data.chatRooms)
      .catch(e => e);

    if (chatRooms instanceof Error) {
      return chatRooms;
    }

    chatRoom = chatRooms ? chatRooms[0] : null;

    return chatRoom;

  }

}

class Module extends PrismaModule {


  getResolvers() {


    return {
      Query: {
        chatMessagesConnection: this.chatMessagesConnection.bind(this),
        chatMessages: this.chatMessages.bind(this),
        chatMessage: this.chatMessage.bind(this),
      },
      Mutation: {
        createChatMessageProcessor: this.createChatMessageProcessor.bind(this),
        updateChatMessageProcessor: this.updateChatMessageProcessor.bind(this),

      },
      Subscription: {
        chatMessage: {
          subscribe: async (parent, args, ctx, info) => {
            return ctx.db.subscription.chatMessage(args, info)
          },
        },
      },
      ChatMessageResponse: this.ChatMessageResponse(),
    }

  }


  async chatMessage(source, args, ctx, info) {

    let objects = await this.chatMessages(source, args, ctx, info);

    return objects && objects[0] || null;

    // return ctx.db.query.chatMessage(args, info);
  }


  chatMessages(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareChatMessagesQueryArgs(args, ctx),
    });

    return ctx.db.query.chatMessages(args, info);
  }


  chatMessagesConnection(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareChatMessagesQueryArgs(args, ctx),
    });

    return ctx.db.query.chatMessagesConnection(args, info);
  }

  prepareChatMessagesQueryArgs(args, ctx) {

    return prepareAccesibleMessagesQuery(args, ctx);
  }

  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return ChatMessageProcessor;
  }

  createChatMessageProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("ChatMessage", args, info);
  }

  updateChatMessageProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("ChatMessage", args, info);
  }

  ChatMessageResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source && source.data || {};

        return id ? ctx.db.query.chatMessage({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default Module;