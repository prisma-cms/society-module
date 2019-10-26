
import {
  getUserId,
} from '../utilites';

import chalk from 'chalk';


const getChatRooms = async function (query, parent, args, ctx, info) {

  // console.log(chalk.green("getChatRooms args"), args);

  let userId;

  try {
    userId = await getUserId(ctx);
  }
  catch (e) {
    // success = false;
    // message = "Please, log in";

    console.error(e);
    throw (new Error("Please, log in"));
  }

  // Получаем только те комнаты, где пользователь состоит

  let {
    where,
  } = args;

  where = Object.assign({ ...where }, {
    Members_some: {
      id: userId
    },
  });


  return query({
    where,
  }, info)
}


const chatRoomsConnection = function (parent, args, ctx, info) {

  // console.log(chalk.green("chatRoomsConnection args"), args);

  return getChatRooms(ctx.db.query.chatRoomsConnection, parent, args, ctx, info);
};

const chatRooms = function (parent, args, ctx, info) {

  return getChatRooms(ctx.db.query.chatRooms, parent, args, ctx, info);


  // return ctx.db.query.chatRooms({
  //   where,
  // }, info)
}

const chatRoom = async function (parent, args, ctx, info) {

  let {
    where: {
      callId,
      ...where
    },
  } = args;


  if (callId) {
    where = {
      ...where,
      Call: {
        id: callId,
      },
    }

    // Очищаем все аргументы
    info.fieldNodes.map(n => {
      n.arguments = []
    });
  
    return (await ctx.db.query.chatRooms({
      first: 1,
      where,
    }, info))[0];

  }
  else{
    return ctx.db.query.chatRoom({}, info);
  }

}


const getChatMessageResponseData = function (source, args, ctx, info) {

  // console.log("getChatMessageResponseData", source);

  const {
    data,
  } = source;

  if (!data) {
    return null;
  }

  const {
    id,
  } = data;

  return ctx.db.query.chatMessage({
    where: {
      id,
    },
  }, info);

}



const Query = {

  chatRoomsConnection,
  chatRooms,
  chatRoom,

}

export default {
  resolvers: {
    Query,
    ChatMessageResponse: {
      data: getChatMessageResponseData,
    },
  },
}