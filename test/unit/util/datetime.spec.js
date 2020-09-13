import {
  today,
  now
} from '../../../src/util/datetime'

test('Now is generated', () => {
  const a = now()
  const b = Math.floor((new Date()).getTime() / 1000)
  const result = Math.abs(Number(a) - Number(b)) < 10 // Within 10 seconds
  expect(result).toBe(true)
})

test('Today is generated', () => {
  const a = today()
  const t = new Date()
  const result = t.getFullYear() + '' + t.getMonth() + '' + t.getDay()
  expect(a).toBe(result)
})
