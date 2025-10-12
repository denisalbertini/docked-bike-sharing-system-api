import BikeRepository from '../../repository/repositories/bike-repository.js';
import BikeAdmissionRepository from '../../repository/repositories/bike-admission-repository.js';
import BikeRemovalRepository from '../../repository/repositories/bike-removal-repository.js';
import BikerRepository from '../../repository/repositories/biker-repository.js';
import ChargeRepository from '../../repository/repositories/charge-repository.js';
import CreditCardRepository from '../../repository/repositories/credit-card-repository.js';
import DockRepository from '../../repository/repositories/dock-repository.js';
import DockAdmissionRepository from '../../repository/repositories/dock-admission-repository.js';
import DockRemovalRepository from '../../repository/repositories/dock-removal-repository.js';
import EmployeeRepository from '../../repository/repositories/employee-repository.js';
import PassportRepository from '../../repository/repositories/passport-repository.js';
import RentalRepository from '../../repository/repositories/rental-repository.js';
import StationRepository from '../../repository/repositories/station-repository.js';

import BikeService from '../../service/services/bike-service.js';
import BikeAdmissionService from '../../service/services/bike-admission-service.js';
import BikeRemovalService from '../../service/services/bike-removal-service.js';
import BikerService from '../../service/services/biker-service.js';
import CCAdminService from '../../service/services/cc-admin-service.js';
import ChargeService from '../../service/services/charge-service.js';
import CreditCardService from '../../service/services/credit-card-service.js';
import DockService from '../../service/services/dock-service.js';
import DockAdmissionService from '../../service/services/dock-admission-service.js';
import DockRemovalService from '../../service/services/dock-removal-service.js';
import EmailService from '../../service/services/email-service.js';
import EmployeeService from '../../service/services/employee-service.js';
import PassportService from '../../service/services/passportService.js';
import RentalService from '../../service/services/rental-service.js';
import StationService from '../../service/services/station-service.js';

import BikeFacade from '../../facade/facades/bike-facade.js';
import BikeAdmissionFacade from '../../facade/facades/bike-admission-facade.js';
import BikeRemovalFacade from '../../facade/facades/bike-removal-facade.js';
import BikerFacade from '../../facade/facades/biker-facade.js';
import ChargeFacade from '../../facade/facades/charge-facade.js';
import DockFacade from '../../facade/facades/dock-facade.js';
import DockAdmissionFacade from '../../facade/facades/dock-admission-facade.js';
import DockRemovalFacade from '../../facade/facades/dock-removal-facade.js';
import EmployeeFacade from '../../facade/facades/employee-facade.js';
import RentalFacade from '../../facade/facades/rental-facade.js';
import StationFacade from '../../facade/facades/station-facade.js';

import BikeController from '../../controller/controllers/bike-controller.js';
import BikeAdmissionController from '../../controller/controllers/bike-admission-controller.js';
import BikeRemovalController from '../../controller/controllers/bike-removal-controller.js';
import BikerController from '../../controller/controllers/biker-controller.js';
import ChargeController from '../../controller/controllers/charge-controller.js';
import DockController from '../../controller/controllers/dock-controller.js';
import DockAdmissionController from '../../controller/controllers/dock-admission-controller.js';
import DockRemovalController from '../../controller/controllers/dock-removal-controller.js';
import EmployeeController from '../../controller/controllers/employee-controller.js';
import RentalController from '../../controller/controllers/rental-controller.js';
import StationController from '../../controller/controllers/station-controller.js';

import sequelize from '../../sequelize/sequelize.js';
import Transaction from '../../model/shared/transaction.js';

// Repositories
const 
bikeRepository = new BikeRepository(), 
bikeAdmissionRepository = new BikeAdmissionRepository(), 
bikeRemovalRepository = new BikeRemovalRepository(), 
bikerRepository = new BikerRepository(), 
chargeRepository = new ChargeRepository(), 
creditCardRepository = new CreditCardRepository(), 
dockRepository = new DockRepository(), 
dockAdmissionRepository = new DockAdmissionRepository(), 
dockRemovalRepository = new DockRemovalRepository(), 
employeeRepository = new EmployeeRepository(), 
passpotRepository = new PassportRepository(), 
rentalRepository = new RentalRepository(), 
stationRepository = new StationRepository();

// Services
const 
bikeService = new BikeService( bikeRepository ), 
bikeAdmissionService = new BikeAdmissionService( bikeAdmissionRepository ), 
bikeRemovalService = new BikeRemovalService( bikeRemovalRepository ), 
bikerService = new BikerService( bikerRepository ), 
ccAdminService = new CCAdminService(), 
chargeService = new ChargeService( chargeRepository ), 
creditCardService = new CreditCardService( creditCardRepository ), 
dockService = new DockService( dockRepository ), 
dockAdmissionService = new DockAdmissionService( dockAdmissionRepository ), 
dockRemovalService = new DockRemovalService( dockRemovalRepository ), 
emailService = new EmailService(), 
employeeService = new EmployeeService( employeeRepository ), 
passportService = new PassportService( passpotRepository ), 
rentalService = new RentalService( rentalRepository ), 
stationService = new StationService( stationRepository );

// Transactions
const 
transaction = new Transaction( sequelize );

// Facades
const 
bikeFacade = new BikeFacade( bikeService, dockService ), 
bikeAdmissionFacade = new BikeAdmissionFacade(
  bikeAdmissionService, bikeService, dockService, transaction
), 
bikeRemovalFacade = new BikeRemovalFacade(
  bikeRemovalService, bikeService, dockService, transaction
), 
bikerFacade = new BikerFacade(
  bikerService, passportService, creditCardService, transaction, emailService
), 
chargeFacade = new ChargeFacade( chargeService, ccAdminService ), 
dockFacade = new DockFacade( dockService ), 
dockAdmissionFacade = new DockAdmissionFacade(
  dockAdmissionService, dockService, stationService, transaction
), 
dockRemovalFacade = new DockRemovalFacade(
  dockRemovalService, dockService, transaction
), 
employeeFacade = new EmployeeFacade( employeeService ), 
rentalFacade = new RentalFacade(
  rentalService, 
  bikerService, 
  bikeService, 
  dockService, 
  chargeService, 
  ccAdminService, 
  stationService, 
  emailService, 
  transaction
), 
stationFacade = new StationFacade( stationService, dockService );

// Controllers
export const 
bikeController = new BikeController( bikeFacade ), 
bikeAdmissionController = new BikeAdmissionController( bikeAdmissionFacade ), 
bikeRemovalController = new BikeRemovalController( bikeRemovalFacade ), 
bikerController = new BikerController( bikerFacade ), 
chargeController = new ChargeController( chargeFacade ), 
dockController = new DockController( dockFacade ), 
dockAdmissionController = new DockAdmissionController( dockAdmissionFacade ), 
dockRemovalController = new DockRemovalController( dockRemovalFacade ), 
employeeController = new EmployeeController( employeeFacade ), 
rentalController = new RentalController( rentalFacade ), 
stationController = new StationController( stationFacade );
