const axios = require('axios');
(async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/audit-logs'); // Wait, frontend proxy is what we used before... let's just use 3000
    } catch (e) {}
})();
