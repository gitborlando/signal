import { batchSignal, createSignal, deriveSignal } from 'packages/core/src/signal'

const firstName = createSignal('张')
const lastName = createSignal('三')
const fullName = deriveSignal(
  firstName,
  lastName,
  (first, last) => `${first}${last}`,
)
const mockHook = () => {
  console.log('mockHook')
}

fullName.hook(mockHook)

batchSignal(firstName, lastName, () => {
  firstName.dispatch('李')
  lastName.dispatch('四')
})
