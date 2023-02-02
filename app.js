//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");  // when using form in html need to use this parser
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();                  //very common to name the express obj as app
var items = ["Buy food", "eat food"];                    
let workItems = [];
app.set('view engine', 'ejs');              //ejs for templates, can use render
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); 

mongoose.set('strictQuery', false);
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });   //create connection and create DB
mongoose.connect("mongodb+srv://Admin:Admin1234@cluster1.kuefeb1.mongodb.net/todolistDB", { useNewUrlParser: true });   //create connection and create DB
//mongodb+srv://Admin:<password>@cluster1.kuefeb1.mongodb.net/test     using online server in atlas

const itemsSchema =  new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);     //creating mongoose model - when creating a model ( ביחיד ) in NodeJS it automatclly convert it to plural name (can be very different, person->people even).

const item1 = new Item({
    name: "Welcome to your to do list"
});
const item2 = new Item({
    name: "Hit the +button to add a new item"
});
const item3 = new Item({
    name: "<--hit this to delete an item>"
});

app.get("/", function(req,res){                  //home route request and response

    Item.find({},function(err,foundItems){
        if (foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err){
                    console.log(err);
                }else{
                    console.log("Seccussfully saved");
                }
            });
            res.redirect("/");
        } else{
        res.render("list", {listTitle: "Today", newListItems: foundItems}); //list is the file inside views folder, kindOfDay is the variable inside the list.ejs file   
        }
        });
    
});

app.get("/:customeListName", function(req,res){      //using parameter

    const customeListName = _.capitalize(req.params.customeListName);  //lodash capilize work to Work


    List.findOne({name: customeListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name: customeListName,
                    items: defaultItems
                 });
            list.save();
            res.redirect("/" + customeListName);
        }else{
                // show an exisiting list
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items}); //list is the file inside views folder, kindOfDay is the variable inside the list.ejs file   
            }
        }
    });

    
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);     //creating mongoose model- when creating a model ( ביחיד ) in NodeJS it automatclly convert it to plural name (can be very different, person->people even).

// Item.insertMany(defaultItems, function(err){
//     if (err){
//         console.log(err);
//     }else{
//         console.log("Seccussfully saved");
//     }
// });

app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName ==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.post("/delete",function(req,res){               //there is no delete page it's just for deleting an item
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if (!err){
                console.log("Successefully delete checked item");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }

    
});

app.post('/work', function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(3000, function(){ 
    console.log("Server started on port 3000");
});