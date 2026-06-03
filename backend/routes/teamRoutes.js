const express = require("express");
const Team = require("../models/Team");

const router = express.Router();

/* ── helpers ── */
const normalizeNs = (ns) => {
  if (Array.isArray(ns)) return [...new Set(ns.filter(Boolean))];
  if (typeof ns === "string" && ns) return [ns];
  return [];
};

/* ── CREATE TEAM ── */
router.post("/", async (req, res) => {
  try {
    const { name, namespace, namespaces } = req.body;

    if (!name) return res.status(400).json({ message: "Team name is required" });

    const nsArr = normalizeNs(namespaces || namespace);
    if (!nsArr.length) return res.status(400).json({ message: "At least one namespace is required" });

    if (await Team.findOne({ name }))
      return res.status(409).json({ message: "Team name already exists" });

    const team = await Team.create({
      name,
      namespaces: nsArr,
      namespace: nsArr[0],   // keep legacy field in sync
    });
    res.status(201).json(team);
  } catch (err) {
    console.error("CREATE TEAM ERROR:", err);
    if (err.code === 11000)
      return res.status(409).json({ message: "Team name already exists" });
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/* ── GET ALL TEAMS ── */
router.get("/", async (req, res) => {
  const teams = await Team.find().sort({ createdAt: -1 });
  res.json(teams);
});

/* ── UPDATE TEAM NAMESPACES ── */
router.put("/:id/namespaces", async (req, res) => {
  try {
    const { namespaces } = req.body;
    const nsArr = normalizeNs(namespaces);

    if (!nsArr.length)
      return res.status(400).json({ message: "At least one namespace is required" });

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { namespaces: nsArr, namespace: nsArr[0] },
      { new: true }
    );
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/* ── UPDATE TEAM NAME ── */
router.put("/:id", async (req, res) => {
  try {
    const { name, namespaces, namespace } = req.body;
    const update = {};
    if (name) update.name = name;
    const nsArr = normalizeNs(namespaces || namespace);
    if (nsArr.length) { update.namespaces = nsArr; update.namespace = nsArr[0]; }

    const team = await Team.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Team name already exists" });
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
