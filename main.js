const App = require("./Routing/App");
const router = require("./Routing/Router");

const PORT = 3000

router.get('/', (req, res) => {
    res.end('Hello')
})


require('./Routes/AccountRoutes')
require('./Routes/SubjectRoutes')
require('./Routes/SchoolClassRoutes')

const app = new App(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`)
})
app.listen()




