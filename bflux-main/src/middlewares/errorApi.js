class APIError extends Error {

    constructor (msg, statusCode, details){
        super(msg);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }

    static badRequest (msg = "Invalid Request", statusCode = 400, details){
        return new this(msg, statusCode, details);
    }
    static notFound (msg = "No Records found", statusCode = 404){
        return new this(msg, statusCode);
    }
    static unauthenticated = (msg = "Please login to have access", statusCode = 401)=>{
        return new this(msg, statusCode);
    }
    static unauthorized = (msg = "Access Denied", statusCode = 403)=>{
        return new this(msg, statusCode);
    }
    static internalServerError = (msg = "Internal Server Error", statusCode = 500, details) => {
        return new this(msg, statusCode, details);
    }
}

module.exports = {
    APIError,
}
