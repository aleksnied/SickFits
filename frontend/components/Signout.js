import React, { Component } from "react"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"
import { CURRENT_USER_QUERY } from "./User"

const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`

class Signout extends Component {
  signout = async signout => {
    const response = await signout()
    console.log(response)
  }

  render() {
    return (
      <Mutation
        mutation={SIGNOUT_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signout, { loading }) => (
          <button onClick={async () => await signout(signout)}>
            Sign{loading ? "ing" : ""} Out{" "}
          </button>
        )}
      </Mutation>
    )
  }
}

export default Signout
