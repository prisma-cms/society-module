
import {
  getUserId,
} from '../utilites';
import chalk from 'chalk';


const chatMessageReaded = {

  subscribe: async (parent, args, ctx, info) => {

    console.log("chatMessageReaded subs args", args);

    // return "Sdfdsf";

    return ctx.db.subscription.chatMessageReaded({}, info)
  },

}


const chatRoom = {

  subscribe: async (parent, args, ctx, info) => {

    console.log(chalk.green("chatRoom subs args"), args);

    // return "Sdfdsf";

    const {
      where: {
        token,
      },
    } = args;

    const userId = await getUserId(ctx, token);

    if (!userId) {
      throw (new Error("Please, log in"));
    }

    // const userId = "cjcwr8ev954yz0116e6fxnx57";


    // Очищаем все аргументы
    info.fieldNodes.map(n => {
      n.arguments = []
    });

    return ctx.db.subscription.chatRoom({
      where: {
        node: {
          Members_some: {
            id: userId,
          }
        }
      }
    }, info)
    // return ctx.db.subscription.chatRoom(args, info)
    // return ctx.db.subscription.chatRoom(args, info)
  },

}


export default {
  chatMessageReaded,
  chatRoom,
}