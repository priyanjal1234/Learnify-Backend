function asyncHandler(requestHandler) {
    (req,res,next) => {
        Promise.resolve(requestHandler()).catch(err => next(err))
    }
}

export default asyncHandler