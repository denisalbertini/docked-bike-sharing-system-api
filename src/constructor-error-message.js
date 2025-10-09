export const 
getBaseClassConstructorMessage = ( className ) => 
  `The ${ className } class cannot be instantiated.`, 
getModelConstructorMessage = ( className ) => 
  `Do not use the "new" operator to instanciate ${ className }. Use the "build" static method instead.`;
