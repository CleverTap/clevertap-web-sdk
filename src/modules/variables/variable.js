export class Variable {
  #variableStore

  /**
   * Creates an instance of the Variable class.
   *
   * @constructor
   * @param {VariableStore} options.variableStore - The VariableStore instance for registration.
   * @param {string|null} options.name - The name of the variable.
   * @param {*} options.defaultValue - The default value of the variable.
   * @param {*} options.value - The current value of the variable.
   * @param {string|null} options.type - The type of the variable (string, number, boolean).
   * @param {boolean} options.hadStarted - A flag indicating whether the variable has started (used internally).
   * @param {Function[]} options.valueChangedCallbacks - Array to store callbacks to be executed when the variable value changes.
   */
  constructor ({ variableStore }) {
    this.name = null
    this.defaultValue = null
    this.value = null
    this.type = null
    this.hadStarted = false
    this.valueChangedCallbacks = []
    this.#variableStore = variableStore
  }

  getValue () {
    return this.value
  }

  getdefaultValue () {
    return this.defaultValue
  }

  /**
   * Defines a new variable with the provided name, default value, and variable store.
   * @static
   * @param {string} name - The name of the variable.
   * @param {*} defaultValue - The default value of the variable.
   * @param {VariableStore} variableStore - The VariableStore instance for registration.
   * @returns {Variable|null} - The created Variable instance or null if invalid parameters are provided.
   */
  static define (name, defaultValue, variableStore) {
    if (!name || typeof name !== 'string') {
      console.error('Empty or invalid name parameter provided.')
      return null
    }
    if (name.startsWith('.') || name.endsWith('.')) {
      console.error('Variable name starts or ends with a `.` which is not allowed: ' + name)
      return null
    }

    const typeOfDefaultValue = typeof defaultValue
    if (typeOfDefaultValue !== 'string' && typeOfDefaultValue !== 'number' && typeOfDefaultValue !== 'boolean') {
      console.error('Only primitive types (string, number, boolean) are accepted as value')
      return null
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
      varInstance.type = typeOfDefaultValue
      variableStore.registerVariable(varInstance)
      varInstance.update(defaultValue)
    } catch (error) {
      console.error(error)
    }
    return varInstance
  }

  /**
   * Updates the variable's value, triggering callbacks if hasVarsRequestCompleted is returned true.
   * @param {*} newValue - The new value to be assigned to the variable.
   */
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

  /**
   * Invokes all registered callbacks when the variable value changes.
   */
  triggerValueChanged () {
    this.valueChangedCallbacks.forEach((onValueChanged) => {
      onValueChanged(this)
    })
  }

  /**
   * Adds a callback function to the array and triggers it immediately if variable requests have completed.
   * @param {Function} onValueChanged - The callback function to be added.
   */
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

  /**
   * Removes a callback function from the array.
   * @param {Function} onValueChanged - The callback function to be removed.
   */
  removeValueChangedCallback (onValueChanged) {
    const index = this.valueChangedCallbacks.indexOf(onValueChanged)
    if (index !== -1) {
      this.valueChangedCallbacks.splice(index, 1)
    }
  }

  /**
   * Resets the `hadStarted` flag to false.
   */
  clearStartFlag () {
    this.hadStarted = false
  }
}
