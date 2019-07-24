
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class GameResultProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "GameResult";

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


export default class GameResultModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return GameResultProcessor;
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
        gameResult: (source, args, ctx, info) => {
          return ctx.db.query.gameResult(args, info);
        },
        gameResults: (source, args, ctx, info) => {
          return ctx.db.query.gameResults(args, info);
        },
        gameResultsConnection: (source, args, ctx, info) => {
          return ctx.db.query.gameResultsConnection(args, info);
        },
      },
      Mutation: {
        ...Mutation,
        createGameResultProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).createWithResponse("GameResult", args, info);
        },
        updateGameResultProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).updateWithResponse("GameResult", args, info);
        },
        deleteGameResult: (source, args, ctx, info) => {
          return this.getProcessor(ctx).delete("GameResult", args, info);
        },
      },
      Subscription: {
        ...Subscription,
        gameResult: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.gameResult({}, info);
          },
        },
      },
      GameResultResponse: {
        data: (source, args, ctx, info) => {

          const {
            id,
          } = source.data || {};

          return id ? ctx.db.query.gameResult({
            where: {
              id,
            },
          }, info) : null;
        },
      },
    }

  }

}