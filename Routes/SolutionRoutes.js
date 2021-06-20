const router = require("../Routing/Router");
const Middleware = require("../CustomMiddleware/Middleware");
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const Assignment = require("../Db/Assignment");
const DefaultResponse = require("../Routing/DefaultResponse");

const routePrefix = '/solutions'
const RouteWithPrefix = (path) => routePrefix + path

const Required = {
    Upload: ['assignment_id'],
    Download: ['assignment_id', 'student_id']
}


let uploadSolution = (req, student_id, assignment_id) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err)
                reject(err)
            let oldPath = files["filetoupload"].path;
            let fileExtension = path.extname(files["filetoupload"].name)
            let newFilename = `${assignment_id}${fileExtension}`
            let newPath = `./uploads/${assignment_id}/${student_id}/${newFilename}`;

            fs.rename(oldPath, newPath, function (err) {
                if (err)
                    reject(err)
                resolve()
            });
        })
    })
}
router.post(RouteWithPrefix('/upload'),
    Middleware.CheckAuthStudent,
    (req, res) => Middleware.CheckFieldsQueryParams(req, res, Required.Upload),
    (req, res) => {

        let stud_ID = req.user["ID"]
        let assignment_ID = req.body[Required.Upload[0]]
        Assignment.ValidSolutionUpload(stud_ID, assignment_ID, assignment_ID)
            .then(() => {
                uploadSolution(req, stud_ID, assignment_ID).then(() => {
                    res.writeHead(200)
                    res.end('File uploaded')
                })
            })
            .catch(e => DefaultResponse.DbPredefinedError(res, e))
    }
)
router.post(RouteWithPrefix('/download'),
    Middleware.CheckAuthTeacher,
    (req, res) => Middleware.CheckFieldsBody(req, res, Required.Upload),
    (req, res) => {

        let assignment_id = req.body['assignment_id'];
        let student_id = req.body['student_id']

        let folderPath = `./uploads/${assignment_id}/${student_id}`

        fs.readdir(folderPath, (err, files) => {
            if (err)
                DefaultResponse.DbPredefinedError(res, err)
            if (files) {
                let file = files[0]
                res.writeHead(200, {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': file[0]["size"]
                });
            }
            else
                res.end('Error')
        })
    }
)