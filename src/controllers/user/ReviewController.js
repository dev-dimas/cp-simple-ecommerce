const {validationResult} = require("express-validator");
const reviewDomain = require("../../domain/review.domain");

const postReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {rating, comment} = req.body;
    const {transactionId, id} = req.params;
    const response = await reviewDomain.postReview(
      rating,
      comment,
      transactionId,
      id,
    );
    res.send({review: response, error: false});
  } catch (error) {
    next(error);
  }
};
const editReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {rating, comment} = req.body;
    const {transactionId, id} = req.params;
    const response = await reviewDomain.editReview(
      rating,
      comment,
      transactionId,
      id,
    );
    res.send({edited_review: response, error: false});
  } catch (error) {
    next(error);
  }
};
const deleteReview = async (req, res, next) => {
  try {
    const {transactionId, id} = req.params;
    await reviewDomain.deleteReview(transactionId, id);
    res.send({message: "OK!", error: false});
  } catch (error) {
    next(error);
  }
};

module.exports = {postReview, editReview, deleteReview};
