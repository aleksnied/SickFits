import { Query } from "react-apollo"
import { CURRENT_USER_QUERY } from "./User"
import Signin from "./Signin"
import Error from "./ErrorMessage"

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <Error error={error} />
      if (!data.me) {
        return (
          <>
            <p>Please Sign In Before Continuing!</p>
            <Signin />
          </>
        )
      }
      return props.children
    }}
  </Query>
)

export default PleaseSignIn
