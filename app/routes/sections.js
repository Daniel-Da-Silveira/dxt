const express = require("express");
const router = express.Router();

// Get all sections for a form
router.get("/api/sections", (req, res) => {
  const formData = req.session.data || {};
  const sections = formData.sections || [];
  res.json(sections);
});

// Create a new section
router.post("/api/sections", (req, res) => {
  try {
    const formData = req.session.data || {};
    const sections = formData.sections || [];
    const newSection = {
      id: Date.now().toString(), // Simple unique ID
      name: req.body.name,
      description: req.body.description || "",
      pages: [],
    };
    sections.push(newSection);
    req.session.data.sections = sections;
    console.log("Created new section:", newSection);
    console.log("Updated sections:", sections);
    res.json(newSection);
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ error: "Failed to create section" });
  }
});

// Update a section
router.put("/api/sections/:id", (req, res) => {
  const formData = req.session.data || {};
  const sections = formData.sections || [];
  const sectionId = req.params.id;
  const sectionIndex = sections.findIndex((s) => s.id === sectionId);

  if (sectionIndex === -1) {
    return res.status(404).json({ error: "Section not found" });
  }

  sections[sectionIndex] = {
    ...sections[sectionIndex],
    name: req.body.name,
    description: req.body.description || sections[sectionIndex].description,
  };

  req.session.data.sections = sections;
  res.json(sections[sectionIndex]);
});

// Delete a section
router.delete("/api/sections/:id", (req, res) => {
  const formData = req.session.data || {};
  const sections = formData.sections || [];
  const sectionId = req.params.id;
  const sectionIndex = sections.findIndex((s) => s.id === sectionId);

  if (sectionIndex === -1) {
    return res.status(404).json({ error: "Section not found" });
  }

  // Remove section from all pages that reference it
  const formPages = formData.formPages || [];
  formPages.forEach((page) => {
    if (page.section && page.section.id === sectionId) {
      delete page.section;
    }
  });

  sections.splice(sectionIndex, 1);
  req.session.data.sections = sections;
  req.session.data.formPages = formPages;
  res.json({ success: true });
});

// Update a page's section
router.put("/api/pages/:pageId/section", (req, res) => {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageId = req.params.pageId;
  const sectionId = req.body.sectionId;

  const pageIndex = formPages.findIndex((p) => String(p.pageId) === pageId);
  if (pageIndex === -1) {
    return res.status(404).json({ error: "Page not found" });
  }

  if (sectionId) {
    const sections = formData.sections || [];
    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }
    formPages[pageIndex].section = section;
  } else {
    delete formPages[pageIndex].section;
  }

  req.session.data.formPages = formPages;
  res.json(formPages[pageIndex]);
});

// Create a new section and assign it to a page
router.post("/api/sections/create", (req, res) => {
  try {
    const { section, pageId } = req.body;
    const formData = req.session.data.formData;

    // Create new section with unique ID
    const newSection = {
      id: Date.now().toString(),
      name: section.name,
      description: section.description,
    };

    // Add section to sections array
    formData.sections = formData.sections || [];
    formData.sections.push(newSection);

    // Update the page with the new section
    formData.formPages = formData.formPages.map((page) =>
      page.pageId === pageId
        ? { ...page, section: { id: newSection.id } }
        : page
    );

    // Update session data
    req.session.data.formData = formData;

    res.json({ success: true, section: newSection });
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ error: "Failed to create section" });
  }
});

module.exports = router;
