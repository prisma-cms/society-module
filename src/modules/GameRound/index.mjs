
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class GameRoundProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "GameRound";

    this.private = true;
    this.ownable = true;
  }


  async create(method, args, info) {

    if(args.data) {

      let {
        ...data
      } = args.data;

      args.data = data;

    }

    return super.create(method, args, info);
  }


  async update(method, args, info) {

    if(args.data) {

      let {
        ...data
      } = args.data;

      args.data = data;

    }

    return super.update(method, args, info);
  }


  async mutate(method, args, info) {

    if(args.data) {

      let {
        ...data
      } = args.data;

      args.data = data;

    }

    return super.mutate(method, args);
  }



  async delete(method, args, info) {

    return super.delete(method, args);
  }
}


export default class GameRoundModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return GameRoundProcessor;
  }


  getResolvers() {

    const {
      Query: {
        ...Query
      },
      Subscription: {
        ...Subscription
      },
      Mutation: {
        ...Mutation
      },
      ...other
    } = super.getResolvers();

    return {
      ...other,
      Query: {
        ...Query,
        gameRound: (source, args, ctx, info) => {
          return ctx.db.query.gameRound(args, info);
        },
        gameRounds: (source, args, ctx, info) => {
          return ctx.db.query.gameRounds(args, info);
        },
        gameRoundsConnection: (source, args, ctx, info) => {
          return ctx.db.query.gameRoundsConnection(args, info);
        },
      },
      Mutation: {
        ...Mutation,
        createGameRoundProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).createWithResponse("GameRound", args, info);
        },
        updateGameRoundProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).updateWithResponse("GameRound", args, info);
        },
        deleteGameRound: (source, args, ctx, info) => {
          return this.getProcessor(ctx).delete("GameRound", args, info);
        },
      },
      Subscription: {
        ...Subscription,
        gameRound: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.gameRound({}, info);
          },
        },
      },
      GameRoundResponse: {
        data: (source, args, ctx, info) => {

          const {
            id,
          } = source.data || {};

          return id ? ctx.db.query.gameRound({
            where: {
              id,
            },
          }, info) : null;
        },
      },
    }

  }

}