const express = require('express');
const router = express.Router();

// Mock data with hierarchical structure
const hierarchicalData = [
    { id: 1, name: 'Root', parentId: null },
    { id: 2, name: 'Child 1', parentId: 1 },
    { id: 3, name: 'Child 2', parentId: 1 },
    { id: 4, name: 'Grandchild 1.1', parentId: 2 },
    { id: 5, name: 'Grandchild 1.2', parentId: 2 },
    { id: 6, name: 'Grandchild 2.1', parentId: 3 },
];

router.get('/hierarchical-data', (req, res) => {
    res.json(hierarchicalData);
});

module.exports = router;
