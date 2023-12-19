const router = require("express").Router();
const path = require("path"); 

router.get("/", (req, res) => {    //requist, response
    res.sendFile(`${__dirname}/public/index.html`); //__dirname (express의 기능: 현재까지의 절대경로)
});
router.get("/loginPage", (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);
});
router.get("/userCreatePage", (req, res) => {
    res.sendFile(`${__dirname}/public/userCreatePage.html`);
});
router.get("/userUpdatePage", (req, res) => {
    res.sendFile(`${__dirname}/public/userUpdatePage.html`);
});
router.get("/boardListPage", (req, res) => {
    res.sendFile(`${__dirname}/public/boardListPage.html`);
});
router.get("/boardCreatePage", (req, res) => {
    res.sendFile(`${__dirname}/public/boardCreatePage.html`);
});
router.get("/boardReadPage", (req, res) => {
    res.sendFile(`${__dirname}/public/boardReadPage.html`);
});

module.exports = router;// import
