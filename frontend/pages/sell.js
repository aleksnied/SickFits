import CreateItem from "../components/CreateItem"
import PleaseSignIn from "../components/PleaseSignIn"

const Sell = _props => (
  <div>
    <PleaseSignIn>
      <CreateItem />
    </PleaseSignIn>
  </div>
)

export default Sell
