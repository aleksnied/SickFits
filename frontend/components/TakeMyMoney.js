/* eslint-disable react/display-name */
import React from "react"
import StripeCheckout from "react-stripe-checkout"
import { Mutation } from "react-apollo"
import { adopt } from "react-adopt"
import Router from "next/router"
import NProgress from "nprogress"
import PropTypes from "prop-types"
import gql from "graphql-tag"
import calcTotalPrice, { calcTotalItems } from "../lib/cartTotals"
import Error from "./ErrorMessage"
import User, { CURRENT_USER_QUERY } from "./User"
import { stripePublishableKey } from "../config"

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  createOrder: ({ render }) => (
    <Mutation
      mutation={CREATE_ORDER_MUTATION}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
    >
      {(createOrder, result) => render({ createOrder, result })}
    </Mutation>
  )
})

class TakeMyMoney extends React.Component {
  onToken = async (res, createOrder) => {
    const order = await createOrder({ variables: { token: res.id } }).catch(
      err => alert(err.message)
    )
    Router.push({
      pathname: "/order",
      query: { id: order.data.createOrder.id }
    })
  }

  render() {
    return (
      <Composed>
        {({
          user: {
            data: { me }
          },
          createOrder: {
            createOrder,
            result: { loading, error }
          }
        }) => {
          if (loading) {
            NProgress.start()
          } else {
            NProgress.done()
          }
          if (error)
            return (
              <>
                <Error error={error} />
                {this.props.children}
              </>
            )
          return (
            <StripeCheckout
              amount={calcTotalPrice(me.cart)}
              name="Sick Fits"
              description={`Order of ${calcTotalItems(me.cart)} items`}
              image={me.cart[0] && me.cart[0].item && me.cart[0].item.image}
              stripeKey={stripePublishableKey}
              currency="GBP"
              email={me.email}
              token={res => this.onToken(res, createOrder)} //TODO pass extra params for country/address- lower chance of rejected payment if more information provided.
            >
              {this.props.children}
            </StripeCheckout>
          )
        }}
      </Composed>
    )
  }
}

export default TakeMyMoney
