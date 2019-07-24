
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class TourneyProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Tourney";

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


export default class TourneyModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return TourneyProcessor;
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
        tourney: (source, args, ctx, info) => {
          return ctx.db.query.tourney(args, info);
        },
        tourneys: (source, args, ctx, info) => {
          return ctx.db.query.tourneys(args, info);
        },
        tourneysConnection: (source, args, ctx, info) => {
          return ctx.db.query.tourneysConnection(args, info);
        },
      },
      Mutation: {
        ...Mutation,
        createTourneyProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).createWithResponse("Tourney", args, info);
        },
        updateTourneyProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).updateWithResponse("Tourney", args, info);
        },
        deleteTourney: (source, args, ctx, info) => {
          return this.getProcessor(ctx).delete("Tourney", args, info);
        },
      },
      Subscription: {
        ...Subscription,
        tourney: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.tourney({}, info);
          },
        },
      },
      TourneyResponse: {
        data: (source, args, ctx, info) => {

          const {
            id,
          } = source.data || {};

          return id ? ctx.db.query.tourney({
            where: {
              id,
            },
          }, info) : null;
        },
      },
    }

  }

}