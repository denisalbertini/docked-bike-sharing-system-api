const errorMessages = {
  BASE_CLASS_CONSTRUCTOR_MESSAGE: ( className ) =>
    `The ${ className } class cannot be instantiated.`, 
  SEQUELIZE_MODEL_CONSTRUCTOR_MESSAGE: ( className ) =>
    `Do not use the "new" operator to instanciate ${ className }. Use the "build" static method instead.`
};

export default errorMessages;
