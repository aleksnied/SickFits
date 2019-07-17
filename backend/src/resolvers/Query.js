const { forwardTo } = require("prisma-binding")

const Query = {
  item: forwardTo("db"),
  items: forwardTo("db"),
  // async items(parent, args, ctx, info) {
  //   const items = await ctx.db.query.items({}, info)

  //   console.log(items)

  //   return items
  // }
  users: forwardTo("db")
}

module.exports = Query
