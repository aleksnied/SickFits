import React, { Component } from "react"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"
import Form from "./styles/Form"
import Error from "./ErrorMessage"

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

class RequestReset extends Component {
  state = {
    email: ""
  }

  handleChange = e => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  requestReset = async (e, requestReset) => {
    e.preventDefault()
    const response = await requestReset()
    console.log(response)
    this.setState({ email: "" })
  }

  render() {
    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={{ ...this.state }}>
        {(requestReset, { loading, error, called }) => (
          <Form
            method="post"
            onSubmit={async e => await this.requestReset(e, requestReset)}
          >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Forgotten password? Request a reset email</h2>
              {!error && !loading && called && (
                <p>Success! Check your email for a reset link.</p>
              )}
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Send{loading ? "ing" : ""}! </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default RequestReset
