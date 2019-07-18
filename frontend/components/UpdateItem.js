import React, { Component } from "react"
import { Mutation, Query } from "react-apollo"
import gql from "graphql-tag"
import Router from "next/router"
import Form from "./styles/Form"
import Error from "./ErrorMessage"

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      title
      price
      description
    }
  }
`

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int # $image: String # $largeImage: String
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price # image: $image # largeImage: $largeImage TODO implement updating images
    ) {
      id
    }
  }
`

class UpdateItem extends Component {
  state = {}

  handleChange = e => {
    const { name, type, value } = e.target
    console.log(name, type, value)
    const val = type === "number" ? parseFloat(value) : value
    this.setState({ [name]: val })
  }

  updateItem = async (e, updateItem) => {
    console.log("Updating item...")
    console.log(this.state)
    e.preventDefault()
    const response = await updateItem()
    console.log("Updated!")
    console.log(response)
    Router.push({
      pathname: "/item",
      query: { id: response.data.updateItem.id }
    })
  }

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, error, loading }) => {
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>No Item found for ID: {this.props.id}</p>
          if (error) return <Error error={error} />
          return (
            <Mutation
              mutation={UPDATE_ITEM_MUTATION}
              variables={{ id: this.props.id, ...this.state }}
            >
              {(updateItem, { loading, error }) => (
                <Form
                  onSubmit={async e => await this.updateItem(e, updateItem)}
                >
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>
                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>
                    <label htmlFor="description">
                      Description
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter a description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>
                    <button type="submit">
                      Sav{loading ? "ing" : "e"} Changes
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default UpdateItem
export { UPDATE_ITEM_MUTATION, SINGLE_ITEM_QUERY }
