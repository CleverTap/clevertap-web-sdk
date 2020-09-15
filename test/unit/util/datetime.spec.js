import {
  today,
  now
} from '../../../src/util/datetime'

test('Now is generated', () => {
  jest.setSystemTime(new Date('01-01-2020'))
  const a = now()
  const b = 1577817000
  const result = Math.abs(Number(a) - Number(b)) < 10 // Within 10 seconds
  expect(result).toBe(true)
})

test('Today is generated', () => {
  const a = today()
  const t = new Date()
  const result = t.getFullYear() + '' + t.getMonth() + '' + t.getDay()
  expect(a).toBe(result)
})
