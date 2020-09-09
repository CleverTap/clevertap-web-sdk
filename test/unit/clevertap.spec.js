import Clevertap from '../../src/clevertap'

test('Clevertap has event', () => {
  const ct = new Clevertap()
  expect(ct.event).toBeDefined()
})

test('Clevertap has profile', () => {
  const ct = new Clevertap()
  expect(ct.profile).toBeDefined()
})

test('Clevertap has account', () => {
  const ct = new Clevertap()
  expect(ct.account).toBeDefined()
})

test('Clevertap has onUserLogin', () => {
  const ct = new Clevertap()
  expect(ct.onUserLogin).toBeDefined()
})

test('Clevertap has notifications', () => {
  const ct = new Clevertap()
  expect(ct.notifications).toBeDefined()
})

test('Clevertap has privacy', () => {
  const ct = new Clevertap()
  expect(ct.privacy).toBeDefined()
})

test('Event can be pushed', () => {
  const ct = new Clevertap()
  expect(ct.event.push).toBeInstanceOf(Function)
})

test('Profile can be pushed', () => {
  const ct = new Clevertap()
  expect(ct.profile.push).toBeInstanceOf(Function)
})

test('Account can be pushed', () => {
  const ct = new Clevertap()
  expect(ct.account.push).toBeInstanceOf(Function)
})

test('onUserLogin can be pushed', () => {
  const ct = new Clevertap()
  expect(ct.onUserLogin.push).toBeInstanceOf(Function)
})

test('Notifications can be pushed', () => {
  const ct = new Clevertap()
  expect(ct.notifications.push).toBeInstanceOf(Function)
})

test('Privacy can be pushed', () => {
  const ct = new Clevertap()
  expect(ct.privacy.push).toBeInstanceOf(Function)
})

test('Clevertap event is always set as array', () => {
  global.clevertap = {event: 'event', profile:[], account:[], onUserLogin:[], notifications:[], privacy:[]} // Will be added by customer during installation
  const ct = new Clevertap(global.clevertap)
  expect(ct.event).toBeInstanceOf(Array)
})

test('Clevertap profile is always set as array', () => {
  global.clevertap = {event: [], profile: 1, account:[], onUserLogin:[], notifications:[], privacy:[]} // Will be added by customer during installation
  const ct = new Clevertap(global.clevertap)
  expect(ct.event).toBeInstanceOf(Array)
})

test('Clevertap account is always set as array', () => {
  global.clevertap = {event: [], profile:[], account: 'WWW-WWW-WWWW', onUserLogin:[], notifications:[], privacy:[]} // Will be added by customer during installation
  const ct = new Clevertap(global.clevertap)
  expect(ct.account).toBeInstanceOf(Array)
})

test('Clevertap onUserLogin is always set as array', () => {
  global.clevertap = {event: [], profile:[], account:[], onUserLogin: 'doSomething', notifications:[], privacy:[]} // Will be added by customer during installation
  const ct = new Clevertap(global.clevertap)
  expect(ct.onUserLogin).toBeInstanceOf(Array)
})

test('Clevertap notifications is always set as array', () => {
  global.clevertap = {event: [], profile:[], account:[], onUserLogin:[], notifications: 1, privacy:[]} // Will be added by customer during installation
  const ct = new Clevertap(global.clevertap)
  expect(ct.notifications).toBeInstanceOf(Array)
})

test('Clevertap privacy is always set as array', () => {
  global.clevertap = {event: [], profile: [], account: [], onUserLogin: [], notifications: [], privacy: {}} // Will be added by customer during installation
  const ct = new Clevertap(global.clevertap)
  expect(ct.privacy).toBeInstanceOf(Array)
})

test('Clevertap accepts account ID as per Web SDK docs', () => {
  global.clevertap = {event:[], profile:[], account:[], onUserLogin:[], notifications:[], privacy:[]} // Will be added by customer during installation
  global.clevertap.account.push({"id": "44Z-R45-995Z"})
  const ct = new Clevertap(global.clevertap)
  expect(ct['account'][0]['id']).toEqual('44Z-R45-995Z')
})
