const { APIError } = require("./errorApi");

exports.validate = (schema, property = "body") => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return next(
        APIError.badRequest("Validation failed", 400, {
          issues: error.details.map((d) => ({ message: d.message, path: d.path })),
        })
      );
    }

    req[property] = value;
    next();
  };
};

