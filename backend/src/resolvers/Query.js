const { forwardTo } = require("prisma-binding")
const { hasPermission, isSignedIn } = require("../utils")

const Query = {
  item: forwardTo("db"),
  items: forwardTo("db"),
  itemsConnection: forwardTo("db"),

  async me(parent, args, ctx, info) {
    return await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    )
  },

  async users(parent, args, ctx, info) {
    isSignedIn(ctx)
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"])
    return ctx.db.query.users({}, info)
  }
}

module.exports = Query
