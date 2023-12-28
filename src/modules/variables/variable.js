export class Variable {
  #variableStore

  constructor ({ variableStore }) {
    this.name = null
    this.defaultValue = null
    this.value = null
    this.type = null
    this.hadStarted = false
    this.valueChangedCallbacks = []
    this.#variableStore = variableStore
  }

  static define (name, defaultValue, variableStore) {
    if (!name || typeof name !== 'string') {
      this.log('Empty or invalid name parameter provided.')
      return null
    }
    if (name.startsWith('.') || name.endsWith('.')) {
      this.log('Variable name starts or ends with a `.` which is not allowed: ' + name)
      return null
    }

    let type = 'string'
    if (typeof defaultValue === 'number') {
      type = 'number'
    } else if (typeof defaultValue === 'boolean') {
      type = 'boolean'
    }

    const existing = variableStore.getVariable(name)
    if (existing) {
      return existing
    }

    const varInstance = new Variable({ variableStore })
    try {
      varInstance.name = name
      varInstance.defaultValue = defaultValue
      varInstance.value = defaultValue
      varInstance.type = type
      variableStore.registerVariable(varInstance)
      varInstance.update(defaultValue)
    } catch (error) {
      console.error(error)
    }
    return varInstance
  }

  update (newValue) {
    const oldValue = this.value
    this.value = newValue
    if (newValue === null && oldValue === null) {
      return
    }
    if (newValue !== null && newValue === oldValue && this.hadStarted) {
      return
    }
    if (this.#variableStore.hasVarsRequestCompleted()) {
      this.hadStarted = true
      this.triggerValueChanged()
    }
  }

  triggerValueChanged () {
    this.valueChangedCallbacks.forEach((onValueChanged) => {
      onValueChanged(this)
    })
  }

  addValueChangedCallback (onValueChanged) {
    if (!onValueChanged) {
      console.log('Invalid callback parameter provided.')
      return
    }
    this.valueChangedCallbacks.push(onValueChanged)

    if (this.#variableStore.hasVarsRequestCompleted()) {
      onValueChanged(this)
    }
  }

  removeValueChangedCallback (onValueChanged) {
    const index = this.valueChangedCallbacks.indexOf(onValueChanged)
    if (index !== -1) {
      this.valueChangedCallbacks.splice(index, 1)
    }
  }

  clearStartFlag () {
    this.hadStarted = false
  }
}
