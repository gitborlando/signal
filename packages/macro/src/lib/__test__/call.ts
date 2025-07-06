import { transformDollarValue } from '../index'

const code = `
function App() {
  const count$ = 0
  return <div>{count$}</div>
}

const App2 = () => {
  const count$ = 0
  return <div>{count$}</div>
}

function useCount() {
  const count$ = 0
  return count
}

const useCount2 = () => {
  const count$ = 0
  return count
}
`

console.log(transformDollarValue(code))
