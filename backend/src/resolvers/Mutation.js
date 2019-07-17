const Mutations = {
  async createItem(parent, args, ctx, info) {
    //TODO check if user is logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    )

    console.log(item)

    return item
  },

  async updateItem(parent, args, ctx, info) {
    //TODO check if user is logged in
    const updates = { ...args }
    delete updates.id
    const item = await ctx.db.mutation.updateItem(
      {
        data: {
          ...updates
        },
        where: {
          id: args.id
        }
      },
      info
    )

    console.log(item)

    return item
  }
}

module.exports = Mutations
