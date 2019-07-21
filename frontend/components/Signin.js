import React, { Component } from "react"
import { Mutation } from "react-apollo"
import Router from "next/router"
import gql from "graphql-tag"
import Form from "./styles/Form"
import Error from "./ErrorMessage"
import { CURRENT_USER_QUERY } from "./User"

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`

class Signin extends Component {
  state = {
    email: "",
    password: ""
  }

  handleChange = e => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  signin = async (e, signin) => {
    e.preventDefault()
    const response = await signin()
    console.log(response)
    Router.push({
      pathname: "/items"
    })
  }

  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={{ ...this.state }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { loading, error }) => (
          <Form
            method="post"
            onSubmit={async e => await this.signin(e, signin)}
          >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign In with an Existing Account</h2>
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
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Sign{loading ? "ing" : ""} In! </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signin
