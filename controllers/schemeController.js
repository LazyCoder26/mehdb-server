const { get } = require("mongoose");
const schemeData = require("../models/schemedata");
const {
  getCurrentTime,
  getCurrentDate,
  generateSrno,
} = require("../utils/utils");

const schemeDetails = {
  getAllSchemes: async (req, res) => {
    try {
      const schemes = await schemeData.find({});
      res.status(200).json(schemes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getSchemeByName: async (req, res) => {
    try {
      const schemeName = req.params.name;
      const schemes = await schemeData.find({
        schemename: { $regex: schemeName, $options: "i" },
      });
      res.status(200).json(schemes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getSchemeById: async (req, res) => {
    try {
      const schemeId = req.params.id;
      const scheme = await schemeData.findById(schemeId);
      if (!scheme) {
        res.status(404).json({ message: "Scheme not found" });
      } else {
        res.status(200).json(scheme);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  addSchemeDetails: async (req, res) => {
    const schemeDetailsArray = req.body; // Expecting an array of schemes

    try {
      const newSchemeEntries = await schemeData.insertMany(
        schemeDetailsArray.map(({ schemename, ministry, desc, place }) => ({
          schemename,
          ministry,
          desc,
          place,
          timeOfschemeAdded: getCurrentTime(),
          date: getCurrentDate(),
          srno: generateSrno(),
        }))
      );

      return res.status(201).json({
        message: "Schemes Added successfully!",
        data: newSchemeEntries,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteSchemeDetails: async (req, res) => {
    const schemeId = req.params.id;

    try {
      const deletedScheme = await schemeData.findByIdAndDelete(schemeId);

      if (!deletedScheme) {
        return res.status(404).json({ message: "Scheme not found." });
      }

      res.status(200).json({ message: "Scheme deleted successfully." });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteSchemeDetailsByName: async (req, res) => {
    const schemeName = req.params.name;

    try {
      const deletedScheme = await schemeData.findOneAndDelete({
        schemename: schemeName,
      });

      if (!deletedScheme) {
        return res.status(404).json({ message: "Scheme not found." });
      }

      res.status(200).json({ message: "Scheme deleted successfully." });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteSchemeDetailsByName: async (req, res) => {
    const schemeNames = Array.isArray(req.body.schemeNames)
      ? req.body.schemeNames
      : [req.body.schemeNames];

    try {
      const deletedSchemes = await schemeData.deleteMany({
        schemename: { $in: schemeNames },
      });
      res.status(200).json(deletedSchemes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  bulkDelete: async (req, res) => {
    try {
      // Expecting an array of identifiers in the request body
      const identifiers = req.body.identifiers;

      if (
        !identifiers ||
        !Array.isArray(identifiers) ||
        identifiers.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Invalid or empty identifiers array." });
      }

      // Assuming identifiers are scheme IDs, you can use deleteMany to delete multiple documents
      const deletedSchemes = await schemeData.deleteMany({
        _id: { $in: identifiers },
      });

      res
        .status(200)
        .json({ message: "Bulk delete successful", deletedSchemes });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  updateSchemeDetails: async (req, res) => {
    const updatedSchemeDataArray = Array.isArray(req.body)
      ? req.body
      : [req.body];

    try {
      const updatedSchemes = await Promise.all(
        updatedSchemeDataArray.map(async (updatedSchemeData) => {
          const schemeId = updatedSchemeData._id;
          return await schemeData.findByIdAndUpdate(
            schemeId,
            updatedSchemeData,
            { new: true }
          );
        })
      );

      res.status(200).json(updatedSchemes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = schemeDetails;
