    // Package
const express = require("express");

    // Init
const app = express();
const port = 8001;
    
// Apis
//html은 왜 public에 넣었을까
app.get("/", (req, res) => {    //requist, response
    res.sendFile(`${__dirname}/public/index.html`); //__dirname (express의 기능: 현재까지의 절대경로)
});
app.get("/loginPage", (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);

});
app.get("/account", (req, res) => {
    const { idx } = req.body;
    const result = {
        "success": false,
        "message": "",
        "date": null
    };
    //DB 통신

    //DB 통신 결과 처리
    result.success = true;
    result.date = {};

    //값 반환
    res.send(result);
});
app.post("/account", (req, res) => {  
    const { id, pw, name } = req.body;
});
app.put("/account", (req, res) => {
    
});
app.delete("/account", (req, res) => {
    
});


//Web Server
    
app.listen(port, () => {
    console.log(`${port}번에서 웹서버 실행`)
})