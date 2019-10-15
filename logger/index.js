exports.logger = (req, res, next) => {
    console.log(`Received ${req.method} request to ${req.originalUrl}`);
    next(); // Passing the request to the next handler in the stack.
}
