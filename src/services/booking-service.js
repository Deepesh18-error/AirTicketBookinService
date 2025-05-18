const aaxios = require('axios');

const { BookingRepository } = require('../repository/index');
const { FLIGHT_SERVICE_PATH } = require('../config/serverconfig');
const { ServiceError } = require('../utils/errors/index');

class BookingService {
    constructor() {
        this.bookingRepository = new BookingRepository();
    }

    async createBooking(data) {
        try {
            const flightId = data.flightId;
            let getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await aaxios.get(getFlightRequestURL);
            const flightData = response.data.data;// for more refining response do flight.data.data
            let priceOfTheFlight = flightData.price;
            if(data.noOfSeats > flightData.totalSeats) {
                throw new ServiceError('Requested seats are not available');
            }

            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = {...data, totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            await aaxios.patch(updateFlightRequestURL, {
                totalSeats: flightData.totalSeats - data.noOfSeats
            });
            const finalBooking = await this.bookingRepository.update(booking.id, {status: 'BOOKED'});
            return finalBooking; 

        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationError') {
                throw error;
            }
            throw new ServiceError();
        }
    }
}

module.exports = BookingService;