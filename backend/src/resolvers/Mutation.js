const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { randomBytes } = require("crypto")
const { promisify } = require("util")

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
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    )
    storeSessionCookieInResponse(user.id, ctx.response)
    console.log("Signed up user:")
    console.log(user)
    return user
  },

  async signin(parent, args, ctx, info) {
    const email = args.email.toLowerCase()
    const user = await ctx.db.query.user(
      {
        where: {
          email
        }
      },
      info
    )
    if (!user || !bcrypt.compare(args.password, user.password))
      throw new Error("Wrong username or password!")
    storeSessionCookieInResponse(user.id, ctx.response)
    console.log("Logged in user:")
    console.log(user)
    return user
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token")
    console.log("Logged out user!")
    return { message: "User successfully logged out!" }
  },

  async requestReset(parent, args, ctx, info) {
    const email = args.email.toLowerCase()
    const resetToken = (await promisify(randomBytes)(20)).toString("hex")
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60
    const user = await ctx.db.mutation.updateUser(
      {
        data: {
          resetToken,
          resetTokenExpiry
        },
        where: {
          email
        }
      },
      "{ email resetToken }"
    )
    if (!user) {
      return { message: "Reset password email sent!" }
    }
    // TODO send email
    console.log("Reset password email sent!")
    return { message: "Reset password email sent!" }
  },

  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords don't match, please retype!")
    }
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now()
      }
    })
    if (!user) {
      throw new Error("Failed to reset password, your token may have expired.")
    }
    const password = await bcrypt.hash(args.password, 10)
    const updatedUser = await ctx.db.mutation.updateUser(
      {
        data: {
          password,
          resetToken: null,
          resetTokenExpiry: null
        },
        where: {
          id: user.id
        }
      },
      info
    )
    storeSessionCookieInResponse(updatedUser.id, ctx.response)
    return updatedUser
  }
}

const storeSessionCookieInResponse = (id, response) => {
  const token = jwt.sign({ userId: id }, process.env.APP_SECRET)
  response.cookie("token", token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365
  })
}

module.exports = Mutations
