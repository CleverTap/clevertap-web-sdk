import clevertap from '../../clevertap'
import Clevertap from '../../src/clevertap'

test('Clevertap has event', () => {
  const ct = new Clevertap()
  expect(ct.event).toBeDefined()
})

test('Clevertap has profile', () => {
  const ct = new Clevertap()
  expect(ct.profile).toBeDefined()
})

test('Event can be pushed', () => {
  const ct = new Clevertap()
  expect(ct.event.push).toBeInstanceOf(Function)
})

test('Clevertap has event key', () => {
  const ct = new Clevertap()
  expect(ct.profile.push).toBeInstanceOf(Function)
})