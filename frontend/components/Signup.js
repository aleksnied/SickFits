import React, { Component } from "react"
import { Mutation } from "react-apollo"
import Router from "next/router"
import gql from "graphql-tag"
import Form from "./styles/Form"
import Error from "./ErrorMessage"
import { CURRENT_USER_QUERY } from "./User"

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`

class Signup extends Component {
  state = {
    email: "",
    name: "",
    password: ""
  }

  handleChange = e => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  signup = async (e, signup) => {
    e.preventDefault()
    const response = await signup()
    console.log(response)
    Router.push({
      pathname: "/items"
    })
  }

  render() {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={{ ...this.state }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { loading, error }) => (
          <Form
            method="post"
            onSubmit={async e => await this.signup(e, signup)}
          >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Up for an Account</h2>
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
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  name="name"
                  autoComplete="nickname"
                  placeholder="name"
                  value={this.state.name}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Sign{loading ? "ing" : ""} Up! </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signup
