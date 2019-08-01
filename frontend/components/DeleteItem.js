import React, { Component } from "react"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"
import { ALL_ITEMS_QUERY } from "./Items"

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
      image
    }
  }
`

class DeleteItem extends Component {
  deleteItem = async deleteItem => {
    const response = await deleteItem()
    console.log(response)
    const url = response.data.deleteItem.image
    this.deleteImageAssets(
      url.substring(
        url.indexOf("sickfits" + 9),
        url.indexOf(".jpg") || url.indexOf(".png")
      )
    )
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

  deleteImageAssets = async assetId => {
    //TODO need to authenticate this call to cloudinary for it to go through
    // console.log("Deleting file...")
    // const data = new FormData()
    // data.append("public_id", assetId)
    // const fileDeletion = await (await fetch(
    //   "https://api.cloudinary.com/v1_1/mailbee/image/destroy",
    //   {
    //     method: "POST",
    //     body: data
    //   }
    // )).json()
    // console.log(fileDeletion)
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
                await this.deleteItem(deleteItem).catch(error => {
                  alert(error.message)
                })
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
