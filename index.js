const express = require("express");

const path = require("path");

const app = express();
const PORT = 8000;

app.set("view engine", "ejs")
app.set("views", path.resolve('./views'))

const cookieParser = require("cookie-parser");

const {connectMongoDB} = require('./connection.js')

const userRoute = require ('./routes/user.route.js')
const {restrictTo,checkForAuthentication} = require('./middlewares/auth.js');
const staticRouter = require('./routes/staticRouter.js')

const URL = require("./models/url.model.js");
const urlRoute = require("./routes/url.route.js");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);
//Middleware


app.use("/url",restrictTo(["NORMAL",['ADMIN']]),urlRoute);
app.use("/user", userRoute);
app.use("/",staticRouter);



app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});


// connection

connectMongoDB('mongodb://127.0.0.1:27017/sample-db')
.then(()=> console.log("mongoDB connected"))
.catch((err)=> console.log("Mongo Err",err))





app.listen(PORT,()=>{
    console.log(`Server is running at port : ${PORT}`);
})