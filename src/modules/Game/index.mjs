
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class GameProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Game";

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


export default class GameModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return GameProcessor;
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
        game: (source, args, ctx, info) => {
          return ctx.db.query.game(args, info);
        },
        games: (source, args, ctx, info) => {
          return ctx.db.query.games(args, info);
        },
        gamesConnection: (source, args, ctx, info) => {
          return ctx.db.query.gamesConnection(args, info);
        },
      },
      Mutation: {
        ...Mutation,
        createGameProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).createWithResponse("Game", args, info);
        },
        updateGameProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).updateWithResponse("Game", args, info);
        },
        deleteGame: (source, args, ctx, info) => {
          return this.getProcessor(ctx).delete("Game", args, info);
        },
      },
      Subscription: {
        ...Subscription,
        game: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.game({}, info);
          },
        },
      },
      GameResponse: {
        data: (source, args, ctx, info) => {

          const {
            id,
          } = source.data || {};

          return id ? ctx.db.query.game({
            where: {
              id,
            },
          }, info) : null;
        },
      },
    }

  }

}