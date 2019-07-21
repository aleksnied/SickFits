const { forwardTo } = require("prisma-binding")

const Query = {
  item: forwardTo("db"),
  items: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  users: forwardTo("db"),
  async me(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      return null
    }
    const user = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    )
    console.log("Retrieved user:")
    console.log(user)
    return user
  }
}

module.exports = Query
