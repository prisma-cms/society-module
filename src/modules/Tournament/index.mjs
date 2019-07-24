
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class TournamentProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Tournament";

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


export default class TournamentModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return TournamentProcessor;
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
        tournament: (source, args, ctx, info) => {
          return ctx.db.query.tournament(args, info);
        },
        tournaments: (source, args, ctx, info) => {
          return ctx.db.query.tournaments(args, info);
        },
        tournamentsConnection: (source, args, ctx, info) => {
          return ctx.db.query.tournamentsConnection(args, info);
        },
      },
      Mutation: {
        ...Mutation,
        createTournamentProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).createWithResponse("Tournament", args, info);
        },
        updateTournamentProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).updateWithResponse("Tournament", args, info);
        },
        deleteTournament: (source, args, ctx, info) => {
          return this.getProcessor(ctx).delete("Tournament", args, info);
        },
      },
      Subscription: {
        ...Subscription,
        tournament: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.tournament({}, info);
          },
        },
      },
      TournamentResponse: {
        data: (source, args, ctx, info) => {

          const {
            id,
          } = source.data || {};

          return id ? ctx.db.query.tournament({
            where: {
              id,
            },
          }, info) : null;
        },
      },
    }

  }

}