import React, { Component } from "react"
import { Query, Mutation } from "react-apollo"
import gql from "graphql-tag"
import PropTypes from "prop-types"
import Table from "./styles/Table"
import Error from "./ErrorMessage"
import SickButton from "./styles/SickButton"

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
]

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $permissions: [Permission]!
    $userId: ID!
  ) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
    }
  }
`

class Permissions extends Component {
  render() {
    return (
      <Query query={ALL_USERS_QUERY}>
        {({ data, loading, error }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <Error error={error} />
          return (
            <>
              <h2>Manage User Permissions</h2>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {possiblePermissions.map(permission => (
                      <th key={permission}>{permission}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(user => (
                    <UserPermissions key={user.id} user={user} />
                  ))}
                </tbody>
              </Table>
            </>
          )
        }}
      </Query>
    )
  }
}

class UserPermissions extends React.Component {
  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = e => {
    const checkbox = e.target
    let updatedPermissions = [...this.state.permissions]
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value)
    } else {
      updatedPermissions = updatedPermissions.filter(
        permission => permission !== checkbox.value
      )
    }
    this.setState({ permissions: updatedPermissions })
    console.log(updatedPermissions)
  }

  render() {
    const user = this.props.user
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{ ...this.state, userId: user.id }}
      >
        {(updatePermissions, { loading, error }) => {
          if (error)
            return (
              <tr>
                <td colSpan="8">
                  <Error error={error} />
                </td>
              </tr>
            )
          return (
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map(permission => (
                <td key={permission}>
                  <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input
                      id={`${user.id}-permission-${permission}`}
                      type="checkbox"
                      name={permission}
                      value={permission}
                      checked={this.state.permissions.includes(permission)}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat{loading ? "ing" : "e"}
                </SickButton>
              </td>
            </tr>
          )
        }}
      </Mutation>
    )
  }
}

UserPermissions.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    permissions: PropTypes.array
  }).isRequired
}

export default Permissions
