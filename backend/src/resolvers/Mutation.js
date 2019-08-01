const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { randomBytes } = require("crypto")
const { promisify } = require("util")
const stripe = require("../stripe")
const { transport, makeANiceEmail } = require("../mail")
const { hasPermission, isSignedIn } = require("../utils")

const Mutations = {
  async createItem(parent, args, ctx, info) {
    isSignedIn(ctx)

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
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
    isSignedIn(ctx)

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
    isSignedIn(ctx)
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`)

    const ownsItem = item.user.id === ctx.request.userId
    const hasPermission = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    )

    if (!ownsItem && !hasPermission) {
      throw new Error("You don't have permission to delete this item.")
    }

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
    console.log(user.id)
    return user
  },

  async signin(parent, args, ctx, info) {
    const email = args.email.toLowerCase()
    let user = await ctx.db.query.user({ where: { email } })
    if (!user) throw new Error("Wrong username or password!")

    const correctPassword = await bcrypt.compare(args.password, user.password)
    if (!correctPassword) throw new Error("Wrong username or password!")

    storeSessionCookieInResponse(user.id, ctx.response)

    console.log("Logged in user:" + user.id)
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
    const mailRes = await transport.sendMail({
      from: "aleksanderniedziolko@gmail.com",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click Here to Reset</a>`)
    })
    console.log(mailRes)
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
  },

  async updatePermissions(parent, args, ctx, info) {
    isSignedIn(ctx)
    const user = ctx.request.user
    hasPermission(user, ["ADMIN", "PERMISSIONUPDATE"])
    const updatedUser = await ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    )
    console.log("Updated user's permissions " + updatedUser.id)
    return updatedUser
  },

  async addToCart(parent, args, ctx, info) {
    isSignedIn(ctx)
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: ctx.request.userId },
        item: { id: args.id }
      }
    })
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      console.log("This item is already in their cart")
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      )
    }
    // 4. If its not, create a fresh CartItem for that user!
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: ctx.request.userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    )
  },

  async removeFromCart(parent, args, ctx, info) {
    isSignedIn(ctx)
    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      "{id user {id}}"
    )
    if (!cartItem) throw new Error("Cart item not found!")
    if (cartItem.user.id !== ctx.request.userId)
      throw new Error("You do not own this cart item!")
    return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info)
  },

  async createOrder(parents, args, ctx, info) {
    isSignedIn(ctx)
    const user = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            title
            price
            id
            description
            image
            largeImage
          }
        }
      }`
    )
    const amount = user.cart.reduce((tally, cartItem) => {
      if (!cartItem.item) return tally
      return tally + cartItem.quantity * cartItem.item.price
    }, 0)

    const charge = await stripe.charges.create({
      amount,
      currency: "GBP",
      source: args.token
    })

    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: user.id } }
      }
      delete orderItem.id
      return orderItem
    })

    const order = await ctx.db.mutation.createOrder(
      {
        data: {
          total: charge.amount,
          charge: charge.id,
          items: { create: orderItems },
          user: { connect: { id: user.id } }
        }
      },
      info
    )

    const cartItemIds = user.cart.map(cartItem => cartItem.id)
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    })

    return order
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
