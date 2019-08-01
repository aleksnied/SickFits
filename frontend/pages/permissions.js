import Permissions from "../components/Permissions"
import PleaseSignIn from "../components/PleaseSignIn"

const PermissionsPage = _props => (
  <div>
    <PleaseSignIn>
      <Permissions />
    </PleaseSignIn>
  </div>
)

export default PermissionsPage
