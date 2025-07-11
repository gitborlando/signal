import { makeAutoObservable, reaction, runInAction } from 'mobx'

class Test {
  firstName = '张'
  lastName = '三'

  constructor() {
    makeAutoObservable(this)
  }

  get fullName() {
    return `${this.firstName}${this.lastName}`
  }
}

const test = new Test()

reaction(
  () => [test.firstName, test.lastName],
  ([firstName, lastName]) => {
    console.log('fullName: ', `${firstName}${lastName}`)
  },
)

runInAction(() => {
  test.firstName = '李'
  test.lastName = '四'
  test.firstName = '王'
  test.lastName = '五'
})
