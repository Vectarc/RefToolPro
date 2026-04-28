/**
 * Utility to transform database snake_case objects to frontend camelCase objects
 */

const transformProject = (project) => {
  if (!project) return null;
  return {
    id: project.id,
    _id: project.id, // For legacy frontend compatibility
    userId: project.user_id,
    name: project.name,
    description: project.description,
    productType: project.product_type,
    lockedRefrigerant: project.locked_refrigerant,
    lockedPressureUnit: project.locked_pressure_unit,
    lockedTemperatureUnit: project.locked_temperature_unit,
    lockedIsAbsolute: project.locked_is_absolute,
    stateCycle: project.state_cycle,
    compressorEfficiency: project.compressor_efficiency,
    createdAt: project.created_at,
    updatedAt: project.updated_at
  };
};

const transformCalculation = (calc) => {
  if (!calc) return null;
  return {
    id: calc.id,
    _id: calc.id, // For legacy frontend compatibility
    projectId: calc.project_id,
    userId: calc.user_id,
    name: calc.name,
    refrigerant: calc.refrigerant,
    pressure: calc.pressure,
    pressureUnit: calc.pressure_unit,
    temperature: calc.temperature,
    temperatureUnit: calc.temperature_unit,
    distanceUnit: calc.distance_unit,
    altitude: calc.altitude,
    ambientPressureData: calc.ambient_pressure_data,
    isDew: calc.is_dew,
    isAbsolute: calc.is_absolute,
    actualTemperature: calc.actual_temperature,
    defineStateCycle: calc.define_state_cycle,
    inputValue: calc.input_value,
    isManual: calc.is_manual,
    liquidTemperature: calc.liquid_temperature,
    order: calc.order,
    createdAt: calc.created_at,
    updatedAt: calc.updated_at
  };
};

const transformHistory = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    _id: item.id, // For legacy frontend compatibility
    userId: item.user_id,
    refrigerant: item.refrigerant,
    pressure: item.pressure,
    pressureUnit: item.pressure_unit,
    temperature: item.temperature,
    temperatureUnit: item.temperature_unit,
    isDew: item.is_dew,
    isAbsolute: item.is_absolute,
    resultEnthalpy: item.result_enthalpy,
    resultEntropy: item.result_entropy,
    resultDensity: item.result_density,
    createdAt: item.created_at
  };
};

module.exports = {
  transformProject,
  transformCalculation,
  transformHistory
};
