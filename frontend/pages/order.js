import CreateItem from "../components/CreateItem"
import PleaseSignIn from "../components/PleaseSignIn"

const Order = props => (
  <div>
    <PleaseSignIn>
      <p>This is the order {props.order.amount}</p>
    </PleaseSignIn>
  </div>
)

export default Order
