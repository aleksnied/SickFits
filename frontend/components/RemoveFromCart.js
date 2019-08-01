import React from "react"
import { Mutation } from "react-apollo"
import styled from "styled-components"
import PropTypes from "prop-types"
import gql from "graphql-tag"
import { CURRENT_USER_QUERY } from "./User"

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`

class RemoveFromCart extends React.Component {
  update = (cache, payload) => {
    const data = cache.readQuery({ query: CURRENT_USER_QUERY })
    data.me.cart = data.me.cart.filter(
      cartItem => cartItem.id !== payload.data.removeFromCart.id
    )
    cache.writeQuery({ query: CURRENT_USER_QUERY, data })
  }

  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: "Mutation",
          removeFromCart: {
            __typename: "CartItem",
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { loading }) => (
          <BigButton
            title="Delete Item"
            disabled={loading}
            onClick={() => {
              removeFromCart().catch(error => alert(error.message))
            }}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    )
  }
}

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired
}

export default RemoveFromCart
