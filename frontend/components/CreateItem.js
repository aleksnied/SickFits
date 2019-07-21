import React, { Component } from "react"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"
import Router from "next/router"
import Form from "./styles/Form"
import Error from "./ErrorMessage"

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`

class CreateItem extends Component {
  state = {
    item: {
      title: "",
      description: "",
      image: "",
      largeImage: "",
      price: 0
    },
    uploading: false
  }

  handleChange = e => {
    const { name, type, value } = e.target
    console.log(name, type, value)
    const val = type === "number" ? parseFloat(value) : value
    console.log(this.state)
    this.setState({ item: { ...this.state.item, [name]: val } })
    console.log(this.state)
  }

  createItem = async (e, createItem) => {
    e.preventDefault()
    const response = await createItem()
    console.log(response)
    Router.push({
      pathname: "/item",
      query: { id: response.data.createItem.id }
    })
  }

  uploadFile = async e => {
    //TODO should delete any existing image asset already in the state
    console.log("Uploading file...")
    const file = e.target.files[0]
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "sickfits")
    this.setState({
      uploading: true
    })
    const fileUpload = await (await fetch(
      "https://api.cloudinary.com/v1_1/mailbee/image/upload",
      {
        method: "POST",
        body: data
      }
    )).json()
    console.log(fileUpload)
    this.setState({
      item: {
        ...this.state.item,
        image: fileUpload.secure_url,
        largeImage: fileUpload.eager[0].secure_url
      },
      uploading: false
    })
  }

  render() {
    const item = this.state.item
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={item}>
        {(createItem, { loading, error }) => (
          <Form onSubmit={async e => await this.createItem(e, createItem)}>
            <Error error={error} />
            <fieldset
              disabled={loading || this.state.uploading}
              aria-busy={loading || this.state.uploading}
            >
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadFile}
                />
              </label>
              {item.image && (
                <img width="200" src={item.image} alt="Upload preview" />
              )}
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={item.title}
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
                  value={item.price}
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
                  value={item.description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit{loading ? "ting" : ""}</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem
export { CREATE_ITEM_MUTATION }
