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
    console.log("Created item:")
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
    console.log("Updated item:")
    console.log(item)

    return item
  },

  async deleteItem(parent, args, ctx, info) {
    //TODO check if user is logged in/permission to delete?
    const where = { id: args.id }
    //find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`)
    //check if they own  it or have permissions
    //TODO
    //delete it
    const deletedItem = await ctx.db.mutation.deleteItem({ where }, info)

    console.log("Deleted item:")
    console.log(deletedItem)

    return deletedItem
  }
}

module.exports = Mutations
