const getBaseClassConstructorMessage = ( className ) => 
  `The ${ className } class cannot be instantiated.`;

const getSequelizeModelConstructorMessage = ( className ) => 
  `Do not use the "new" operator to instanciate ${ className }. Use the "build" static method instead.`;

export {
  getBaseClassConstructorMessage, 
  getSequelizeModelConstructorMessage
};
