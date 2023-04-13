import express, { ErrorRequestHandler } from "express";

export const errorHandler : ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack)
    const status = err.status || 400
    res.status(status).send(err.message)
}
module.exports = errorHandler;