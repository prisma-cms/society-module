import chalk from "chalk";

import Processor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import {
  prepareAccesibleMessagesQuery,
} from "../../helpers";

export class ChatMessageProcessor extends Processor {



  constructor(props) {

    super(props);

    this.objectType = "ChatMessage";

    // this.private = true;

    /**
     * Разрешается ли слать анонимные сообщения в рамках проекта
     */
    this.allowAnonymous = true;

  }


  /**
   * Создаем чат-сообщение.
   * При этом создается или подключается чат-комната.
   */
  async create(objectType, args, info) {

    /**
     * Отправитель
     */
    let Sender;

    /**
     * Получатель сообщения. Нужен для того, чтобы определиться,
     * можно ему отправить сообщение или нет.
     */
    let Receiptor;

    /**
     * Целевая комната.
     * Если уже есть, то из нее будем получать разрешения.
     */
    let TargetChatRoom;

    const {
      allowAnonymous,
    } = this;


    const {
      db,
      currentUser,
    } = this.ctx;

    Sender = currentUser;

    let {
      data: {
        CreatedBy,
        Room: RoomArgs,
        ...data
      },
    } = args;

    let {
      to,
      ...Room
    } = RoomArgs || {};


    let {
      connect,
    } = Room || {};


    let currentUserId;

    let chatRoom;

    // console.log("ChatMessage::create args", JSON.stringify(args, true, 2));

    // console.log("ChatMessage::create Room", JSON.stringify(Room, true, 2));

    /**
     * Всю логику для внешних запросов следует обрабатывать именно здесь.
     * Мы можем явно передать от кого создается сообщение, если это выполняется со стороны сервера.
     * Для того, чтобы с фронта не могли создавать сообщения от кого угодно. в схеме удаляем возможность
     * передавать CreatedBy.
     * Если не передано CreatedBy, проверяем доступность чат-комнаты.
     * По сути, из-за ограничения схемы, при внешних запросах CreatedBy всегда отсутствует,
     * так что основная логика находится именно в этом блоке.
     */
    if (!CreatedBy) {

      const {
        id,
        sudo,
      } = currentUser || {};

      currentUserId = id;

      /**
       * Здесь уже следует определиться с получателем и комнатой,
       * так как в зависимости от их настроек будет определяться можно им
       * отправлять сообщение или нет
       */

      if (currentUserId) {

        CreatedBy = {
          connect: {
            id: currentUserId,
          },
        }

      }
      else if (!allowAnonymous) {
        return this.addError("Необходимо авторизоваться");
      }


      // console.log("ChatMessage::create currentUser", JSON.stringify(currentUser, true, 2));

      /**
       * Если это для текущего пользователя, то допускается возможность неявного указания комнаты
       */

      // console.log("connect", connect);

      if (connect) {

        const room = await db.query.chatRoom({
          where: connect,
        })
          .catch(console.error);

        // console.log('room', room);


        if (!room) {
          return this.addError("Не была получена чат-комната");
        }

        // console.log('TargetChatRoom room 1', room);

        TargetChatRoom = room;

        // console.log(chalk.green("room"), room);
        // return "sdfdsf"

        let {
          id: roomId,
        } = room || {}


        let OR;


        if (!sudo) {

          OR = [
            {
              isPublic: true,
            },
          ]


          if (currentUserId) {

            OR = OR.concat([
              {
                Members_some: {
                  id: currentUserId
                },
              },
              {
                Invitations_some: {
                  User: {
                    id: currentUserId,
                  }
                },
              },
            ]);

          }

        }


        // console.log(chalk.green("OR"), OR);


        let roomWhere = {
          id: roomId,
          OR,
        };

        // console.log(chalk.green("roomWhere"), JSON.stringify(roomWhere, true, 2));


        // Пытаемся получить чат-комнату
        chatRoom = await this.getRoomWithMember({
          where: roomWhere,
        })
          .catch(console.error);

        // console.log(chalk.green("chatRoom"), chatRoom);
        // return "sdfdsf"

        if (!chatRoom) {
          return this.addError("Не была получена чат-комната");
        }

      }


      else if (to) {

        let createdById;

        if (currentUserId) {
          createdById = currentUserId;
        }
        // else {
        //   return this.addError("Приватные сообщения можно отправлять только в существующие чат-комнаты.");
        // }

        // Проверяем есть ли пользователь
        const toUser = await db.query.user({
          where: {
            id: to,
          },
        })
          .catch(console.error);


        if (!toUser) {
          return this.addError("Не был получен пользователь");
        }
        else {

          /**
           * Если отправитель не анонимный, то пытаемся
           * получить совместную с получателем комнату.
           * А если анонимный, то пытаемся получить публичную комнату-мусорку,
           * или, если такой нет, то создаем ее. Такая комната по-умолчанию
           * будет публичная, и все дальнейшие анонимные сообщения будут
           * сыпаться в нее. При этом комната будет считаться созданная получателем.
           * Если получатель в дальнейшем эту комнату сделает приватной, то новые
           * сообщения будут падать в новую комнату.
           */

          const {
            id: toUserId,
            acceptChatMessageAnonymous,
            acceptNewChatRoomAnonymous,
            acceptNewChatRoom,
          } = toUser;

          let sandbox;
          let isPublic;

          if (currentUserId) {

            // Пытаемся получить чат-комнату
            chatRoom = await this.getRoomWithMember({
              where: {
                isPublic: false,
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

          }
          else {

            /**
             * Проверяем разрешил ли пользователь отправлять ему сообщения
             * анонимным пользователям
             */
            if (!acceptChatMessageAnonymous) {

              return this.addError("Пользователь не разрешил отправлять ему анонимные сообщения.");
            }
            else {

              /**
               * Пытаемся получить песочную чат-комнату.
               * Если комната получена, то можно слать сообщение.
               * Если нет, то проверяем разрешено ли создавать новую комнату для общения.
               */
              chatRoom = await this.getRoomWithMember({
                where: {
                  CreatedBy: {
                    id: toUserId,
                  },
                  isPublic: true,
                  sandbox: true,
                },
              });

              // console.log("sandbox chatRoom", chatRoom);

              /**
               * Если можно, то создаем новую чат-комнату от имени получателя.
               */
              createdById = toUserId;

              sandbox = true;
              isPublic = true;

            }

          }


          // console.log("chatRoom", chatRoom);
          // console.log("chatRoom json", JSON.stringify(chatRoom, true, 2));


          // Если нет чат-комнаты, создаем новую
          if (!chatRoom) {

            /**
               * Проверяем разрешил ли пользователь создавать с ним новые чат-комнаты
               */
            if (!acceptNewChatRoom) {

              return this.addError("Пользователь не разрешил заводить с ним новые диалоги.");
            }
            else if (!currentUserId && !acceptNewChatRoomAnonymous) {

              return this.addError("Пользователь не разрешил заводить с ним новые диалоги неавторизованным пользователям.");
            }

            // console.log("chatRoom", chatRoom);

            const usersIds = [currentUserId, toUserId].filter(n => n);

            if (!usersIds) {
              return this.addError('Не был указан ни один пользователь');
            }

            // console.log('usersIds', usersIds);

            let name = "";

            if (usersIds.length) {
              name = (await db.query.users({
                where: {
                  id_in: usersIds,
                },
              }))
                .map(({
                  username,
                  firstname,
                  lastname,
                  fullname,
                }) => fullname || [firstname, lastname].filter(n => n).join(" ") || username)
                .filter(n => n && n.trim())
                .join(", ");
            }


            if (!createdById) {
              return this.addError('Не был получен создатель комнаты');
            }

            Room = {
              create: {
                name,
                sandbox,
                isPublic,
                Members: {
                  connect: usersIds.map(id => ({ id })),
                },
                CreatedBy: {
                  connect: {
                    id: createdById,
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

            // console.log('create TargetChatRoom chatRoom TargetChatRoom', JSON.stringify(TargetChatRoom, true, 2));
            // console.log('create TargetChatRoom chatRoom', JSON.stringify(chatRoom, true, 2));

            TargetChatRoom = chatRoom;

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


      /**
       * В этот момент нам нужен объект чат-комнаты, чтобы решить,
       * можно создавать сообщение или нет.
       * Но комнаты может и не быть, если это сообщение в новую комнату.
       */

      // console.log('create TargetChatRoom', JSON.stringify(TargetChatRoom, true, 2));

      // console.log('CreatedBy', JSON.stringify(CreatedBy, true, 2));

      // if (!CreatedBy) {
      //   return this.addError("Необходимо авторизоваться");
      // }


    }
    else {

      /**
       * ToDo: надо разобраться с дальнейшей логикой.
       */
      if (!connect) {
        return this.addError("Не указана комната");
      }

    }



    const {
      content,
    } = this.prepareContent(args) || {};

    if (!content) {
      return this.addError("Сообщение не заполнено");
    }


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

    // if (!Room) {

    // }


    // this.addFieldError("test", "test");
    // return;


    Object.assign(data, {
      CreatedBy,
      Room,
    });


    Object.assign(args, {
      data,
    });


    // console.log('create args', JSON.stringify(args, true, 2));

    // return;

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
              Invitations,
            } = chatRoom;

            // console.log("Members", Members);

            // console.log("Members.findIndex", Members.findIndex(({ id }) => id === currentUserId));

            if (currentUserId && Members.findIndex(({ id }) => id === currentUserId) === -1) {

              const Invitation = Invitations.find(n => n.User.id === currentUserId);

              if (isPublic || Invitation) {

                let data = {
                  Members: {
                    connect: {
                      id: currentUserId,
                    },
                  },
                }

                /**
                 * Если есть приглашение в комнату, удаляем его
                 */
                if (Invitation) {

                  const {
                    id: invitationId,
                  } = Invitation;

                  // console.log("invitationId", invitationId);

                  Object.assign(data, {
                    Invitations: {
                      delete: [{
                        id: invitationId,
                      }],
                    },
                  });
                }

                // console.log('updateChatRoom data', JSON.stringify(data, true, 2));

                await db.mutation.updateChatRoom({
                  where: {
                    id: chatRoomId,
                  },
                  data,
                })
                  // .then(r => {

                  //   return r;
                  // })
                  .catch(console.error);

              }


              // console.log("Members result", result);
            }
          }


          // Создаем уведомление, если сообщение не прочитано в течение заданного времени
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

                // console.log(chalk.green("message"), message);

                // return;

                /**
                 * Сообщение к этому моменту может уже быть удалено
                 */
                if (message) {

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
                          CreatedBy,
                          ChatMessage: {
                            connect: {
                              id: messageId,
                            }
                          },
                        }
                      })
                        .catch(console.error);

                    });

                }

              })
              .catch(error => {
                console.error(chalk.red("Get message error"), error)
              });


          }, 1000 * 10)

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

    // console.log('getRoomWithMember args', JSON.stringify(args, true, 2));

    const {
      db,
    } = this.ctx;

    const {
      where,
    } = args;

    return db.query.chatRooms({
      where,
      first: 1,
    }, `
      {
        id
        code
        name
        isPublic
        Members{
          id
          username
        }
        Invitations{
          id
          User{
            id
            username
          }
        }
      }
    `)
      .then(([chatRoom]) => {

        // console.log('chatMessage getRoomWithMember chatRoom', chatRoom);

        return chatRoom;
      });

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
        Invitations{
          id
          User{
            id
            username
          }
        }
      }
    }
  `, {
      chatRoomsWhere: where,
    })
      .then(r => {

        // console.log('chatMessage getRoomWithMember result', r);

        return r.data.chatRooms;
      })
      .catch(e => e);

    if (chatRooms instanceof Error) {
      return chatRooms;
    }

    chatRoom = chatRooms ? chatRooms[0] : null;

    return chatRoom;

  }


  /**
   * Отметка сообщения о прочтении.
   * Для этого создается новая запись ReadedBy и удаляется нотис, если имеется
   * Нотисы надо удалять только для текущего пользователя
   */
  async markAsReaded(objectType, args, info) {

    let result = false;

    const {
      currentUser,
      db,
    } = this.ctx;

    const {
      id: currentUserId,
    } = currentUser || {};

    if (currentUserId) {

      let {
        where,
      } = args;

      const message = await db.query.chatMessage({
        where,
      }, `
        {
          id
          ReadedBy(
            where: {
              User: {
                id: "${currentUserId}"
              }
            }
          ){
            id
          }
        }
      `)
        .catch(console.error);


      // console.log(chalk.green("message"), message);

      if (message) {

        const {
          ReadedBy,
        } = message;

        /**
         * Если нет еще отметки о прочтении, создаем
         */
        if (!ReadedBy.length) {

          await db.mutation.updateChatMessage({
            where,
            data: {
              ReadedBy: {
                create: {
                  User: {
                    connect: {
                      id: currentUserId,
                    },
                  },
                },
              },
            },
          })
          // .then(async r => {

          //   result = true;

          //   // Удаляем уведомление, если имеются
          //   // await db.mutation.deleteManyNotices({
          //   //   where: {
          //   //     ChatMessage: where,
          //   //   },
          //   // })
          //   //   .catch(console.error)


          // });


        }
        else {
          result = true;
        }

        /**
         * Удалять уведомления надо по одному, потому что иначе не отрабатываются подписки
         */
        db.query.notices({
          where: {
            ChatMessage: where,
          },
        })
          .then(notices => {

            // console.log(chalk.green("notices"), notices);

            if (notices && notices.length) {

              notices.map(n => {

                const {
                  id: noticeId,
                } = n || {};

                if (noticeId) {

                  db.mutation.deleteNotice({
                    where: {
                      id: noticeId,
                    },
                  })
                    .catch(console.error);

                }

              });

            }

          })
          .catch(console.error);

      }

    }

    return result;
  }

}

export class ChatMessageModule extends PrismaModule {


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
        markAsReadedChatMessage: this.markAsReadedChatMessage.bind(this),

      },
      Subscription: {
        chatMessage: {
          subscribe: async (parent, args, ctx, info) => {

            // console.log("chatMessage subscribe");

            let {
              node,
              ...where
            } = args.where || {}

            node = node || {};

            // Object.assign(args, {
            // });

            node = this.prepareChatMessagesQueryArgs({
              where: node,
            }, ctx);

            // console.log("chatMessage subscribe where node", JSON.stringify(node, true, 2));

            Object.assign(args, {
              where: {
                ...where,
                node,
              },
            });

            // console.log("chatMessage subscribe where args.where", JSON.stringify(args.where, true, 2));

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

  markAsReadedChatMessage(source, args, ctx, info) {

    return this.getProcessor(ctx).markAsReaded("ChatMessage", args, info);
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


export default ChatMessageModule;