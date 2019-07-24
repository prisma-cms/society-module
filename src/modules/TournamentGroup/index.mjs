
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class TournamentGroupProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "TournamentGroup";

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


export default class TournamentGroupModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return TournamentGroupProcessor;
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
        tournamentGroup: (source, args, ctx, info) => {
          return ctx.db.query.tournamentGroup(args, info);
        },
        tournamentGroups: (source, args, ctx, info) => {
          return ctx.db.query.tournamentGroups(args, info);
        },
        tournamentGroupsConnection: (source, args, ctx, info) => {
          return ctx.db.query.tournamentGroupsConnection(args, info);
        },
      },
      Mutation: {
        ...Mutation,
        createTournamentGroupProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).createWithResponse("TournamentGroup", args, info);
        },
        updateTournamentGroupProcessor: (source, args, ctx, info) => {
          return this.getProcessor(ctx).updateWithResponse("TournamentGroup", args, info);
        },
        deleteTournamentGroup: (source, args, ctx, info) => {
          return this.getProcessor(ctx).delete("TournamentGroup", args, info);
        },
      },
      Subscription: {
        ...Subscription,
        tournamentGroup: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.tournamentGroup({}, info);
          },
        },
      },
      TournamentGroupResponse: {
        data: (source, args, ctx, info) => {

          const {
            id,
          } = source.data || {};

          return id ? ctx.db.query.tournamentGroup({
            where: {
              id,
            },
          }, info) : null;
        },
      },
    }

  }

}