const asyncHandler = require("../utils/asyncHandler");
const crud = require("../services/crud.service");

const buildCrudController = ({ model, populate, searchFields, allowedFields }) => {
  return {
    list: asyncHandler(async (req, res) => {
      const { page, limit, sort, q } = req.query;
      const data = await crud.list({
        model,
        page: page || 1,
        limit: limit || 20,
        sort: sort || "-createdAt",
        search: q,
        searchFields: searchFields || [],
        populate,
      });
      res.json({ success: true, ...data });
    }),
    get: asyncHandler(async (req, res) => {
      const item = await crud.getById({ model, id: req.params.id, populate });
      res.json({ success: true, item });
    }),
    create: asyncHandler(async (req, res) => {
      const item = await crud.create({ model, payload: req.body, allowedFields });
      res.status(201).json({ success: true, item });
    }),
    update: asyncHandler(async (req, res) => {
      const item = await crud.updateById({ model, id: req.params.id, payload: req.body, allowedFields });
      res.json({ success: true, item });
    }),
    remove: asyncHandler(async (req, res) => {
      const item = await crud.removeById({ model, id: req.params.id });
      res.json({ success: true, item });
    }),
  };
};

module.exports = { buildCrudController };
