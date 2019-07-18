import React, { Component } from "react"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"
import { ALL_ITEMS_QUERY } from "./Items"

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`

class DeleteItem extends Component {
  deleteItem = async deleteItem => {
    const response = await deleteItem()
    console.log(response)
  }

  update = (cache, { data: { deleteItem } }) => {
    var { items } = cache.readQuery({ query: ALL_ITEMS_QUERY })
    items = items.filter(function(item) {
      return item.id !== deleteItem.id
    })
    cache.writeQuery({
      query: ALL_ITEMS_QUERY,
      data: { items: items }
    })
  }

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
      >
        {(deleteItem, { loading, error }) => (
          <button
            onClick={async () => {
              if (confirm("Are you sure you want to delete this item?")) {
                await this.deleteItem(deleteItem)
              }
            }}
          >
            {loading ? "Deleting..." : this.props.children}
            {error && " Failed"}
          </button>
        )}
      </Mutation>
    )
  }
}

export default DeleteItem
