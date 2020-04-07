

import {
  getUserId,
} from '../utilites';
// import chalk from 'chalk';


const getRoomWithMember = async function (args, ctx) {

  const {
    db,
  } = ctx;

  const {
    where,
  } = args;


  return db.query.chatRooms({
    where,
    first: 1,
  }, `
    {
      id
      Members{
        id
        username
      }
    }
  `)
    .then(([chatRoom]) => {

      // console.log('Mutation getRoomWithMember chatRoom', chatRoom);

      return chatRoom;
    });


  // let chatRoom;

  // const chatRooms = await db.request(`
  //   query chatRooms(
  //     $chatRoomsWhere:ChatRoomWhereInput
  //   ){
  //     chatRooms(
  //       where:$chatRoomsWhere
  //     ){
  //       id
  //       Members{
  //         id
  //         username
  //       }
  //     }
  //   }
  // `, {
  //   chatRoomsWhere: where,
  // })
  //   .then(r => {

  //     console.log('getRoomWithMember result', r);

  //     return r.data.chatRooms;
  //   })
  // // .catch(e => e);

  // /**
  //  * Не понятно почему здесь возвращал объект ошибки.
  //  * Судя по всему это кривая логика.
  //  */
  // // if (chatRooms instanceof Error) {
  // //   return chatRooms;
  // // }

  // chatRoom = chatRooms ? chatRooms[0] : null;

  // return chatRoom;

}



const createChatMessageProcessor = async function (source, args, ctx, info) {

  let message = "";
  let errors = [];
  let data;
  let success;


  /**
   * Если указан roomId (ID комнаты), то смотрим по ней, и чтобы отправитель был в этой комнате,
   * а кому он шлет - это уже его дело.
   * Если указан to (ID пользователя), то смотрим по нему.
   */

  let {
    to,
    roomId,
    ...messageData
  } = args;


  const {
    db,
  } = ctx;


  let userId;
  let chatRoom;


  // Получаем текущего пользователя
  try {
    userId = await getUserId(ctx);
  }
  catch (e) {
    success = false;
    message = "Please, log in";
  }

  if (!to && !roomId) {
    success = false;
    message = "Can not get roomId or recipient";
  }

  else {

    if (roomId) {


      // Пытаемся получить чат-комнату
      chatRoom = await getRoomWithMember({
        where: {
          id: roomId,
          Members_some: {
            id: userId
          },
        },
      }, ctx);

    }

  }



  if (!userId) {

  }
  else if (userId === to) {

    success = false;
    message = "Can not send message to self";

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
      success = false;
      message = "Can not get target user";
    }
    else {

      // Пытаемся получить чат-комнату
      // !!! Этот запрос выполняется ниже при создании
      chatRoom = await getRoomWithMember({
        where: {
          Members_every: {
            id_in: [userId, toUser.id]
          },
          AND: [{
            Members_some: {
              id: userId
            },
          }, {
            Members_some: {
              id: toUser.id
            },
          }],
        },
      }, ctx);

      // console.log("chatRoom", chatRoom);

      // Если нет чат-комнаты, создаем новую
      if (!chatRoom) {

        let name = (await db.query.users({
          where: {
            id_in: [userId, toUser.id],
          },
        })).map(({ username, firstname, lastname }) => [firstname, lastname].filter(n => n).join(" ") || username).join(", ");

        const chatRoomData = {
          // created_at: Math.round(new Date().getTime() / 1000),
          // name: toUser.username,
          name,
          Members: {
            connect: [{
              id: userId,
            }, {
              id: toUser.id,
            }],

            // connect: [{
            //   id: "cjcwr8ev954yz0116e6fxnx57",
            // },{
            //   id: "cjcww5hnt73fr0116nrl4vrj7",
            // }],
          },
          CreatedBy: {
            connect: {
              id: userId,
            },
          },
        };


        // console.log(chalk.green("Creat chatRoom chatRoomData"), chatRoomData);


        chatRoom = await db.mutation.createChatRoom({
          data: chatRoomData,
        })
          .catch(error => {
            console.error("Creat chatRoom error", error);
            throw error;
          });

        /**
         * Получаем комнату с участниками, так как при создании они не участвуют в выдаче
         */
        chatRoom = await getRoomWithMember({
          where: {
            Members_every: {
              id_in: [userId, toUser.id]
            },
            AND: [{
              Members_some: {
                id: userId
              },
            }, {
              Members_some: {
                id: toUser.id
              },
            }],
          },
        }, ctx);

      }
      else {

        /**
         * Обновляем комнату, чтобы актуализировать сортировкукомнат
         * Важно это сделать раньше обновления сообщения, чтобы результат попал в сообщение
         * Пока не работает
         */
        // await db.mutation.updateChatRoom({
        //   where: {
        //     id: chatRoom.id,
        //   },
        //   data: {},
        // });
      }


    }

  }


  // console.log("chatRoom 2", chatRoom);

  if (!chatRoom) {
    success = false;
    message = "Can not get chat room";
  }
  else {

    const {
      id: chatId,
    } = chatRoom;


    if (!errors.length && success !== false) {



      // Если чат-комната имеется, создаем новое сообщение
      const message = await db.mutation.createChatMessage({
        data: Object.assign({ ...messageData }, {
          // created_at: Math.round(new Date().getTime() / 1000),
          Author: {
            connect: {
              id: userId,
            },
          },
          Room: {
            connect: {
              id: chatId,
            },
          },
        }),
      })
        .then(r => {

          const message = r;

          // Если все ОК, создаем уведомления для всех, кому оно адресовано
          chatRoom.Members.map(member => {

            const memberId = member.id;

            if (memberId === userId) {
              return;
            }

            // Создаем уведомление, если сообщение не прочитано в течение минуты
            // и если нет уведомлений в этой ветке

            setTimeout(() => {

              // Смотрим было ли уже прочтено это сообщение
              db.query.chatMessageReadeds({
                where: {
                  Message: {
                    id: message.id,
                  },
                  User: {
                    id: memberId,
                  },
                }
              })
                .then(readed => {

                  // console.log("readed messages", readed);

                  // Смотрим есть ли уже активные уведомления для этого пользователя 
                  // из данной диалоговой ветки

                  if (!readed.length) {
                    db.query.notifications({
                      first: 1,
                      where: {
                        type: "Message",
                        objectId: chatId,
                        User: {
                          id: memberId,
                        },
                        active: true,
                      },
                    })
                      .then(exists => {

                        // console.log("Notifications exists", exists);

                        if (!exists.length) {
                          db.mutation.createNotification({
                            data: {
                              type: "Message",
                              data: {},
                              User: {
                                connect: {
                                  id: memberId,
                                }
                              },
                              CreatedBy: userId,
                              objectId: chatId,
                            }
                          })
                            .catch(console.error);
                        }


                      })
                      .catch(console.error);
                  }


                })
                .catch(console.error);




            }, 1000 * 10);


          });



          return r;
        })
      // .catch(console.error);

      data = message;

    }

  }



  // console.log("userId", userId);


  return {
    success: success === undefined && !errors.length && data ? true : false,
    message,
    errors,
    data,
  };

}


const updateChatRoom = function (source, args, ctx, info) {

  return ctx.db.mutation.updateChatRoom(args, info);
}


const Mutation = {
  // createChatMessageProcessor,
  updateChatRoom,
};

export { Mutation }