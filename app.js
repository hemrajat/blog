//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const homeStartingContent = "Hello user this is a very simple blog website where you can add new blog just clicking on button 'New Blog' and read them whenever you need to.";
const aboutContent = "I'm Hemraj Choudhary working very hard to make technology available to everyone.";
const contactContent = "";
const app = express();
mongoose.connect(process.env.DB,{ useNewUrlParser: true , useUnifiedTopology: true});
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const BlogPostScheme = {
  title: String,
  content: String
};
const MessageSchema ={
  name: String,
  email: String,
  message: String
};
const Blog = mongoose.model("Blog",BlogPostScheme);
const Messages = mongoose.model("Message",MessageSchema);
app.get("/", function(req, res){
  Blog.find(function(err,blogs){
    if(!err){
      res.render("home", {
        startingContent: homeStartingContent,
        posts: blogs
        });
    }
  });
});
app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});
app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.upperFirst(req.params.postName);
  Blog.findOne({title:requestedTitle},function(err,result){
    if(!err){
      let id = result._id;
      res.render("post",{
        title:requestedTitle,
        content:result.content,
        blogId:id,
        editId:id
      });
    };
  });
});
app.post("/compose", async function(req, res){
  const post = new Blog({
    title: _.upperFirst((req.body.postTitle).trim()),
    content: req.body.postBody
  });
  await post.save();
  res.redirect("/");
});
app.post("/newblog",function(req,res){
  res.render("compose")
});
app.post("/deleteThisBlog",function(req,res){
  Blog.findOneAndDelete({_id:req.body.delete},function(err){
    if(!err){
      console.log("Successfully deleted");
    }
    else{
      console.log(err);
    }
  });
  res.redirect("/");
});
app.post("/contactmessage",function(req,res){
  const message = new Messages({
    name:req.body.name,
    email:req.body.mailid,
    message:req.body.message
  });
  message.save();
  res.render("sent");
});
app.post("/edit",function(req,res){
  const blogIdToUpdate = req.body.edit;
  // console.log(blogIdToUpdate);

  Blog.findOne({_id:blogIdToUpdate},function(err,result){
    if(!err){
      res.render("edit",{
        title:result.title,
        content:result.content,
        blogId:result.id
      });
    };
  });
});
app.post("/update", function(req,res){
  const blogIdToUpdate = req.body.blogId;
  const newTitle = req.body.updateTitle;
  const newContent = req.body.updatePost;
  Blog.findOneAndUpdate({_id:blogIdToUpdate},{title:newTitle,content:newContent},function(err){
    if(!err){
      console.log("Successfully edited");
    };
  });
  res.redirect("/");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
};
app.listen(port, function() {
  console.log("Server started successfully");
});
