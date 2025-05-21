const { BookingService } = require('../services/index');
const { StatusCodes } = require('http-status-codes');

const bookingService = new BookingService();

const { createChannel, publishMessage } = require('../utils/messageQueues');

const { REMAINDER_BINDING_KEY, EXCHANGE_NAME } = require('../config/serverconfig');
class BookingController {

    constructor(){

    }

    async sendMessageToQueue(req, res){
        const channel = await createChannel();
        const data = {message: 'SUCCESS'};
        publishMessage(channel, JSON.stringify(data), REMAINDER_BINDING_KEY);
        return res.status(200).json({
            message: 'Successfully published the event to the queue',
        }); 
    }
    async create (req, res){
    try {
        const response = await bookingService.createBooking(req.body);
        return res.status(StatusCodes.OK).json({
            data: response,
            success: true,
            err: {},
            message: 'Booking created successfully',
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            data: {},
            success: false,
            message: error.message,
            err: error.explanation,
        });
    }
}
}


module.exports = BookingController;