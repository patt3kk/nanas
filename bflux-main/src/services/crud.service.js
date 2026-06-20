const { APIError } = require("../middlewares/errorApi");

const setPath = (target, path, value) => {
  const parts = String(path).split(".");
  let cursor = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }
    if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  });
};

const pickAllowedFields = (payload, allowedFields = []) => {
  if (!allowedFields || allowedFields.length === 0) return { ...payload };

  const picked = {};
  allowedFields.forEach((field) => {
    const parts = String(field).split(".");
    let source = payload;
    for (const part of parts) {
      if (source === null || source === undefined || typeof source !== "object" || !(part in source)) {
        source = undefined;
        break;
      }
      source = source[part];
    }

    if (source !== undefined) {
      setPath(picked, field, source);
    }
  });
  return picked;
};

const list = async ({ model, query = {}, search, searchFields = [], page = 1, limit = 20, sort = "-createdAt", populate }) => {
  const filter = { ...query };

  if (search && searchFields.length > 0) {
    filter.$or = searchFields.map((f) => ({ [f]: { $regex: String(search), $options: "i" } }));
  }

  const skip = (Number(page) - 1) * Number(limit);
  let q = model.find(filter).sort(sort).skip(skip).limit(Number(limit));
  if (populate) q = q.populate(populate);

  const [items, total] = await Promise.all([q.lean().exec(), model.countDocuments(filter)]);
  return { items, page: Number(page), limit: Number(limit), total };
};

const getById = async ({ model, id, populate }) => {
  let q = model.findById(id);
  if (populate) q = q.populate(populate);
  const doc = await q.exec();
  if (!doc) throw APIError.notFound("Resource not found");
  return doc;
};

const create = async ({ model, payload, allowedFields }) => {
  const safePayload = pickAllowedFields(payload, allowedFields);
  if (Object.keys(safePayload).length === 0) {
    throw APIError.badRequest("No valid fields provided");
  }
  return model.create(safePayload);
};

const updateById = async ({ model, id, payload, allowedFields }) => {
  const safePayload = pickAllowedFields(payload, allowedFields);
  if (Object.keys(safePayload).length === 0) {
    throw APIError.badRequest("No valid fields provided");
  }
  const doc = await model.findByIdAndUpdate(id, { $set: safePayload }, { new: true, runValidators: true }).exec();
  if (!doc) throw APIError.notFound("Resource not found");
  return doc;
};

const removeById = async ({ model, id }) => {
  const doc = await model.findByIdAndDelete(id).exec();
  if (!doc) throw APIError.notFound("Resource not found");
  return doc;
};

module.exports = { list, getById, create, updateById, removeById };
