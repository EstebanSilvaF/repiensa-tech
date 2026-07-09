import StartPage from './StartPage'

describe('<StartPage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<StartPage />)
  })
})