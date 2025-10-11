import { Model } from "sequelize";
import {
  getBaseClassConstructorMessage, 
  getModelConstructorMessage
} from "../model/shared/constructor-error-message.js";

export default class BaseModel extends Model {
  constructor() {
    const className = new.target.name;

    const message = className === BaseModel.name ?
      getBaseClassConstructorMessage( className ) :
      getModelConstructorMessage( className );

    throw new Error( message );
  }
}
