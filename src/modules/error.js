const haveSession = (req, res, next) => {
    if (req.session.userId) {
        const error = new Error("already have session");
        error.status = 401;
        next(error);        
    }
    else {
        next();
    }
} 
const leckSession = (req, res, next) => {
    if (req.session.userId) {
        next();
    }
    else {
        const error = new Error("dont have session");
        error.status = 401;
        next(error);     
    }
} 

const queryCheck = (query) => {
    const list = Object.entries(query);
    const error = new Error;
    error.status = 400;

    for (let idx = 0; idx < list.length; idx++){
        if (!list[idx][1] || list[idx][1] === undefined) {
            error.message = `error occurs at ${list[idx][0]} , ${list[idx][0]} = [${list[idx][1]}]`;
            return { success: false, error: error };
        }
        if (!patternSelect(list[idx][0]).test(list[idx][1])) {
            error.message = `regex fault at ${list[idx][0]}`;
            return { success: false, error: error };
        } //pattern.test(id)
    }

    return { success: true, error: null };
}
// const pattern = /^[a-zA-Z0-9]{6,30}$/;
// const namePattern = /^[a-zA-Z가-힣]{1,30}$/;
// const phonenumberPattern = /^[0-9]{11}$/;
// const datePattern = /^\d{4}-\d{2}-\d{2}$/;
// const titlePattern = /^.{1,50}$/;
// const maintextPattern = /^.{1,5000}$/;
// const replyPattern = /^.{1,500}$/;

const patternSelect = (str) => {
    if (str === "id" || str === "password" || str === "passwordCheck") {
        return /^[a-zA-Z0-9]{6,30}$/;
    }
    if (str === "name") {
        return /^[a-zA-Z가-힣]{1,30}$/;
    }
    if (str === "phonenumber") {
        return /^[0-9]{11}$/;
    }
    if (str === "title") {
        return /^.{1,50}$/;
    }
    if (str === "maintext") {
        return /^.{1,5000}$/;
    }
    if (str === "reply") {
        return /^.{1,500}$/;
    }
}
module.exports.haveSession = haveSession;
module.exports.leckSession = leckSession;
module.exports.queryCheck = queryCheck;
