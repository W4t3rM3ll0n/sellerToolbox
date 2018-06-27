require('dotenv').config()

module.exports = {
    
    getDbConnectionString: function() {
        return { 
            database: process.env.DB_ROUTE, 
            secret: process.env.DB_SECRET
        }
    },

}
