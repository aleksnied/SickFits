import Router from "next/router"
import Signup from "../components/Signup"
import Signin from "../components/Signin"
import styled from "styled-components"
import RequestReset from "../components/RequestReset"

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`

const SigninPage = _props => (
  <div>
    <Columns>
      <Signup />
      <Signin onSignin={() => Router.push({ pathname: "/items" })} />
      <RequestReset />
    </Columns>
  </div>
)

export default SigninPage
