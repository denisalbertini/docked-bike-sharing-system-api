import Bike from './bike.js';
import BikeAdmission from './bikeAdmission.js';
import BikeRemoval from './bikeRemoval.js';
import Biker from './biker.js';
import Charge from './charge.js';
import CreditCard from './creditCard.js';
import Dock from './dock.js';
import DockAdmission from './dockAdmission.js';
import DockRemoval from './dockRemoval.js';
import Employee from './employee.js';
import Passport from './passport.js';
import Rental from './rental.js';
import Station from './station.js';

const models = [
  Bike, 
  BikeAdmission, 
  BikeRemoval, 
  Biker, 
  Charge, 
  CreditCard, 
  Dock, 
  DockAdmission, 
  DockRemoval, 
  Employee, 
  Passport, 
  Rental, 
  Station
];

export default function init( sequelize ) {
  models.forEach( model => model.init( sequelize ) );
  models.forEach( model => model.defineAssociations() );
}
