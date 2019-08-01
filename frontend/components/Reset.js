import React, { Component } from "react"
import { Mutation } from "react-apollo"
import Router from "next/router"
import gql from "graphql-tag"
import PropTypes from "prop-types"
import Form from "./styles/Form"
import Error from "./ErrorMessage"
import { CURRENT_USER_QUERY } from "./User"

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
    }
  }
`

class Reset extends Component {
  state = {
    resetToken: this.props.resetToken,
    password: "",
    confirmPassword: ""
  }

  handleChange = e => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  reset = async (e, reset) => {
    e.preventDefault()
    const response = await reset()
    console.log(response)
    Router.push({
      pathname: "/items"
    })
  }

  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{ ...this.state }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(reset, { loading, error }) => (
          <Form method="post" onSubmit={async e => await this.reset(e, reset)}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Please enter a new password</h2>
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
              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="password"
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Confirm{loading ? "ing" : ""}! </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

Reset.propTypes = {
  resetToken: PropTypes.string.isRequired
}

export default Reset
